using API.DataSchema;
using API.DataSchema.DTO.Transporte;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace API.Services.Transporte
{
    public class TransporteProConfigService : ITransporteProConfigService
    {
        private readonly DataContext _context;

        public TransporteProConfigService(DataContext context)
        {
            _context = context;
        }

        public async Task<TransporteProConfigDTO> GetAsync(long id_evento)
        {
            if (id_evento <= 0) throw new Exception("Id de evento inválido.");

            var existeEvento = await _context.ef_eventos.AnyAsync(x => x.id_evento == id_evento);
            if (!existeEvento) throw new Exception("Evento inexistente.");

            var row = await _context.ef_evento_transporte_pro_config
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (row == null)
            {
                // Devolvemos defaults (sin crear registro)
                return new TransporteProConfigDTO
                {
                    id_evento = id_evento,
                    pro_habilitado = false,
                    requiere_pago = false,
                    max_plazas_por_reserva = 4,
                    permitir_reservar_ida = true,
                    permitir_reservar_vuelta = true,
                    vencimiento_minutos_pago = null,
                    pago = new TransporteProConfigDTO.PagoTransferenciaDTO(),
                    fecha_modif = null
                };
            }

            return Map(row);
        }

        public async Task<TransporteProConfigDTO> UpsertAsync(long id_evento, TransporteProConfigUpsertRequest req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (id_evento <= 0) throw new Exception("Id de evento inválido.");

            var evento = await _context.ef_eventos.FindAsync(id_evento);
            if (evento == null) throw new Exception("Evento inexistente.");

            // Validaciones simples
            if (req.max_plazas_por_reserva <= 0) throw new Exception("max_plazas_por_reserva inválido.");
            if (req.vencimiento_minutos_pago != null && req.vencimiento_minutos_pago <= 0)
                throw new Exception("vencimiento_minutos_pago inválido.");

            var row = await _context.ef_evento_transporte_pro_config
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (row == null)
            {
                row = new ef_evento_transporte_pro_config
                {
                    id_evento = id_evento,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.ef_evento_transporte_pro_config.Add(row);
            }

            row.pro_habilitado = req.pro_habilitado;
            row.requiere_pago = req.requiere_pago;

            row.max_plazas_por_reserva = req.max_plazas_por_reserva;
            row.permitir_reservar_ida = req.permitir_reservar_ida;
            row.permitir_reservar_vuelta = req.permitir_reservar_vuelta;
            row.vencimiento_minutos_pago = req.vencimiento_minutos_pago;

            // Pago: si requiere_pago=false, igual guardamos lo que venga (por si lo prenden después),
            // pero el front lo ocultará. Si preferís limpiar, lo hacemos.
            if (req.pago != null)
            {
                row.pago_titular_cuenta = req.pago.pago_titular_cuenta;
                row.pago_cbu_alias = req.pago.pago_cbu_alias;
                row.pago_banco = req.pago.pago_banco;
                row.pago_instrucciones = req.pago.pago_instrucciones;
            }

            row.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Map(row);
        }

        private TransporteProConfigDTO Map(ef_evento_transporte_pro_config row)
        {
            return new TransporteProConfigDTO
            {
                id_evento = row.id_evento,
                pro_habilitado = row.pro_habilitado,
                requiere_pago = row.requiere_pago,
                max_plazas_por_reserva = row.max_plazas_por_reserva,
                permitir_reservar_ida = row.permitir_reservar_ida,
                permitir_reservar_vuelta = row.permitir_reservar_vuelta,
                vencimiento_minutos_pago = row.vencimiento_minutos_pago,
                pago = new TransporteProConfigDTO.PagoTransferenciaDTO
                {
                    pago_titular_cuenta = row.pago_titular_cuenta,
                    pago_cbu_alias = row.pago_cbu_alias,
                    pago_banco = row.pago_banco,
                    pago_instrucciones = row.pago_instrucciones
                },
                fecha_modif = row.fecha_modif
            };
        }
    }
}