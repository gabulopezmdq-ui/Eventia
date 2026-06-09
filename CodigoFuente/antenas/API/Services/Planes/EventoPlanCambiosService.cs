using API.DataSchema;
using API.DataSchema.DTO.Planes;
using API.Services.Precios;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public class EventoPlanCambiosService : IEventoPlanCambiosService
    {
        private readonly DataContext _context;
        private readonly IPreciosService _preciosService;

        public EventoPlanCambiosService(DataContext context, IPreciosService preciosService)
        {
            _context = context;
            _preciosService = preciosService;
        }

        public async Task<CambioPlanDTO> SolicitarCambioPlanAsync(long id_evento, long id_usuario, SolicitarCambioPlanDTO req)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (string.IsNullOrWhiteSpace(req.codigo_plan_solicitado))
                throw new Exception("Debe informar el plan solicitado.");

            req.codigo_plan_solicitado = req.codigo_plan_solicitado.Trim().ToUpperInvariant();

            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (evento == null)
                throw new Exception("Evento inexistente.");

            // Este service es SOLO para eventos B2C.
            // Si el evento pertenece a una cuenta, el cambio de plan debe gestionarse desde cuenta.
            if (evento.id_cuenta.HasValue)
                throw new Exception("El cambio de plan de eventos B2B debe gestionarse desde la cuenta.");

            bool esOwner = await (
                from eu in _context.ef_evento_usuarios
                join r in _context.ef_roles on eu.id_rol equals r.id_rol
                where eu.id_evento == id_evento
                   && eu.id_usuario == id_usuario
                   && eu.activo
                   && r.codigo == "EVENT_OWNER"
                select eu.id_evento_usuario
            ).AnyAsync();

            if (!esOwner)
                throw new Exception("No tenés permiso para solicitar cambio de plan en este evento.");

            if (!evento.id_plan.HasValue)
                throw new Exception("El evento no tiene plan actual asignado.");

            bool yaTienePendiente = await _context.ef_evento_plan_cambios
                .AnyAsync(x => x.id_evento == id_evento && x.estado == "PENDIENTE");

            if (yaTienePendiente)
                throw new Exception("Este evento ya tiene una solicitud de cambio de plan pendiente.");

            var planActual = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_plan == evento.id_plan.Value);

            if (planActual == null)
                throw new Exception("No se encontró el plan actual del evento.");

            if (planActual.tipo != "B2C")
                throw new Exception("El plan actual del evento no es B2C.");

            var planSolicitado = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo == req.codigo_plan_solicitado);

            if (planSolicitado == null)
                throw new Exception("No se encontró el plan solicitado.");

            if (planSolicitado.tipo != "B2C")
                throw new Exception("Este endpoint solo permite solicitar cambios a planes B2C.");

            if (planSolicitado.id_plan == planActual.id_plan)
                throw new Exception("El evento ya tiene ese plan.");

            var mercadoMoneda = await ResolverMercadoMonedaEventoAsync(evento);

            var precioActual = await _preciosService.GetPrecioPlanAsync(
                planActual.codigo,
                mercadoMoneda.codigo_mercado
            );

            var precioSolicitado = await _preciosService.GetPrecioPlanAsync(
                planSolicitado.codigo,
                mercadoMoneda.codigo_mercado
            );

            decimal diferenciaBase =
                precioSolicitado.precio_publicado
                - precioActual.precio_publicado;

            if (diferenciaBase < 0)
                diferenciaBase = 0;

            var now = DateTimeOffset.UtcNow;

            var cambio = new ef_evento_plan_cambios
            {
                id_evento = id_evento,
                id_plan_actual = planActual.id_plan,
                id_plan_solicitado = planSolicitado.id_plan,

                estado = "PENDIENTE",

                codigo_mercado = mercadoMoneda.codigo_mercado,
                codigo_moneda = mercadoMoneda.codigo_moneda,

                precio_plan_actual_reconocido = precioActual.precio_publicado,
                precio_plan_solicitado_lista = precioSolicitado.precio_lista,
                precio_plan_solicitado_publicado = precioSolicitado.precio_publicado,

                diferencia_base = diferenciaBase,
                total_a_cobrar = diferenciaBase,

                motivo_solicitud = req.motivo_solicitud,
                id_usuario_solicita = id_usuario,

                fecha_solicitud = now,
                fecha_alta = now
            };

            _context.ef_evento_plan_cambios.Add(cambio);

            await _context.SaveChangesAsync();

            return new CambioPlanDTO
            {
                id_evento_plan_cambio = cambio.id_evento_plan_cambio,
                id_evento = cambio.id_evento,

                plan_actual_codigo = planActual.codigo,
                plan_solicitado_codigo = planSolicitado.codigo,

                codigo_mercado = cambio.codigo_mercado,
                codigo_moneda = cambio.codigo_moneda,

                precio_plan_actual_reconocido = cambio.precio_plan_actual_reconocido,
                precio_plan_solicitado_publicado = cambio.precio_plan_solicitado_publicado,

                diferencia_base = cambio.diferencia_base,
                total_a_cobrar = cambio.total_a_cobrar,

                estado = cambio.estado,
                fecha_solicitud = cambio.fecha_solicitud
            };
        }

        public async Task<CambioPlanDTO?> GetPendienteEventoAsync(long id_evento, long id_usuario)
        {
            bool tieneAcceso = await (
                from eu in _context.ef_evento_usuarios
                join r in _context.ef_roles on eu.id_rol equals r.id_rol
                where eu.id_evento == id_evento
                   && eu.id_usuario == id_usuario
                   && eu.activo
                   && (r.codigo == "EVENT_OWNER" || r.codigo == "EVENT_HOST")
                select eu.id_evento_usuario
            ).AnyAsync();

            if (!tieneAcceso)
                throw new Exception("No tenés permiso para consultar este evento.");

            var item = await (
                from c in _context.ef_evento_plan_cambios.AsNoTracking()
                join pa in _context.ef_planes.AsNoTracking()
                    on c.id_plan_actual equals pa.id_plan
                join ps in _context.ef_planes.AsNoTracking()
                    on c.id_plan_solicitado equals ps.id_plan
                where c.id_evento == id_evento
                      && c.estado == "PENDIENTE"
                select new CambioPlanDTO
                {
                    id_evento_plan_cambio = c.id_evento_plan_cambio,
                    id_evento = c.id_evento,

                    plan_actual_codigo = pa.codigo,
                    plan_solicitado_codigo = ps.codigo,

                    codigo_mercado = c.codigo_mercado,
                    codigo_moneda = c.codigo_moneda,

                    precio_plan_actual_reconocido = c.precio_plan_actual_reconocido,
                    precio_plan_solicitado_publicado = c.precio_plan_solicitado_publicado,

                    diferencia_base = c.diferencia_base,
                    total_a_cobrar = c.total_a_cobrar,

                    estado = c.estado,
                    fecha_solicitud = c.fecha_solicitud
                }
            ).FirstOrDefaultAsync();

            return item;
        }

        private async Task<(string codigo_mercado, string codigo_moneda)> ResolverMercadoMonedaEventoAsync(ef_eventos evento)
        {
            short? idPais = evento.id_pais;

            if (!idPais.HasValue)
                throw new Exception("No se pudo determinar el país comercial del evento.");

            var mercadoPais = await _context.ef_mercado_paises
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_pais == idPais.Value && x.activo);

            if (mercadoPais == null)
                throw new Exception("No se encontró mercado comercial para el país del evento.");

            var mercado = await _context.ef_mercados
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo_mercado == mercadoPais.codigo_mercado && x.activo);

            if (mercado == null)
                throw new Exception("El mercado comercial no existe o no está activo.");

            return (mercado.codigo_mercado, mercado.codigo_moneda_default);
        }
    }
}