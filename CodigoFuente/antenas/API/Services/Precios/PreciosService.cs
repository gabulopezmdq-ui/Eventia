using API.DataSchema;
using API.DataSchema.DTO.Precios;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Precios
{
    public class PreciosService : IPreciosService
    {
        private readonly DataContext _context;

        public PreciosService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<PrecioPlanDTO>> GetPlanesAsync(string tipo, string codigo_mercado)
        {
            if (string.IsNullOrWhiteSpace(tipo))
                tipo = "B2C";

            if (string.IsNullOrWhiteSpace(codigo_mercado))
                codigo_mercado = "AR";

            tipo = tipo.Trim().ToUpper();
            codigo_mercado = codigo_mercado.Trim().ToUpper();

            var ahora = DateTimeOffset.UtcNow;

            var query =
                from precio in _context.ef_precios.AsNoTracking()
                join plan in _context.ef_planes.AsNoTracking()
                    on precio.id_plan equals plan.id_plan
                where precio.objeto_tipo == "PLAN"
                   && plan.tipo == tipo
                   && precio.codigo_mercado == codigo_mercado
                   && precio.activo
                   && precio.vigente_desde <= ahora
                   && (precio.vigente_hasta == null || precio.vigente_hasta >= ahora)
                orderby plan.id_plan
                select new
                {
                    plan.id_plan,
                    codigo_plan = plan.codigo,
                    nombre_plan = plan.nombre,
                    precio.codigo_mercado,
                    precio.codigo_moneda,
                    precio.precio_lista,
                    precio.precio_lanzamiento,
                    precio.lanzamiento_desde,
                    precio.lanzamiento_hasta
                };

            var datos = await query.ToListAsync();

            return datos.Select(x =>
            {
                bool tieneLanzamiento =
                    x.precio_lanzamiento.HasValue
                    && (!x.lanzamiento_desde.HasValue || x.lanzamiento_desde.Value <= ahora)
                    && (!x.lanzamiento_hasta.HasValue || x.lanzamiento_hasta.Value >= ahora);

                return new PrecioPlanDTO
                {
                    id_plan = x.id_plan,
                    codigo_plan = x.codigo_plan,
                    nombre_plan = x.nombre_plan,
                    codigo_mercado = x.codigo_mercado,
                    codigo_moneda = x.codigo_moneda,
                    precio_lista = x.precio_lista,
                    precio_lanzamiento = x.precio_lanzamiento,
                    precio_publicado = tieneLanzamiento ? x.precio_lanzamiento.Value : x.precio_lista,
                    tiene_lanzamiento = tieneLanzamiento
                };
            }).ToList();
        }

        public async Task<PrecioPlanDTO> GetPrecioPlanAsync(string codigo_plan, string codigo_mercado)
        {
            if (string.IsNullOrWhiteSpace(codigo_plan))
                throw new Exception("Debe informar el código del plan.");

            if (string.IsNullOrWhiteSpace(codigo_mercado))
                codigo_mercado = "AR";

            codigo_plan = codigo_plan.Trim().ToUpper();
            codigo_mercado = codigo_mercado.Trim().ToUpper();

            var ahora = DateTimeOffset.UtcNow;

            var dato = await (
                from precio in _context.ef_precios.AsNoTracking()
                join plan in _context.ef_planes.AsNoTracking()
                    on precio.id_plan equals plan.id_plan
                where precio.objeto_tipo == "PLAN"
                   && plan.codigo == codigo_plan
                   && precio.codigo_mercado == codigo_mercado
                   && precio.activo
                   && precio.vigente_desde <= ahora
                   && (precio.vigente_hasta == null || precio.vigente_hasta >= ahora)
                select new
                {
                    plan.id_plan,
                    codigo_plan = plan.codigo,
                    nombre_plan = plan.nombre,
                    precio.codigo_mercado,
                    precio.codigo_moneda,
                    precio.precio_lista,
                    precio.precio_lanzamiento,
                    precio.lanzamiento_desde,
                    precio.lanzamiento_hasta
                }
            ).FirstOrDefaultAsync();

            if (dato == null)
                throw new Exception("No se encontró precio vigente para el plan y mercado informado.");

            bool tieneLanzamiento =
                dato.precio_lanzamiento.HasValue
                && (!dato.lanzamiento_desde.HasValue || dato.lanzamiento_desde.Value <= ahora)
                && (!dato.lanzamiento_hasta.HasValue || dato.lanzamiento_hasta.Value >= ahora);

            return new PrecioPlanDTO
            {
                id_plan = dato.id_plan,
                codigo_plan = dato.codigo_plan,
                nombre_plan = dato.nombre_plan,
                codigo_mercado = dato.codigo_mercado,
                codigo_moneda = dato.codigo_moneda,
                precio_lista = dato.precio_lista,
                precio_lanzamiento = dato.precio_lanzamiento,
                precio_publicado = tieneLanzamiento ? dato.precio_lanzamiento.Value : dato.precio_lista,
                tiene_lanzamiento = tieneLanzamiento
            };
        }
    }
}