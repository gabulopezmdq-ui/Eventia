using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.Interfaz;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class ParametricaService : IParametricaService
    {
        private readonly DataContext _context;

        public ParametricaService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<ParametricaDTO>> GetAsync(
            string entidad,
            short idIdioma)
        {
            var baseQuery = ResolveBase(entidad);

            return await (
                from tr in _context.ef_param_traducciones
                join b in baseQuery
                    on tr.id_item equals b.Id
                where tr.entidad == entidad
                   && tr.id_idioma == idIdioma
                   && tr.activo
                   && b.Activo
                orderby tr.orden ?? 999, tr.texto
                select new ParametricaDTO
                {
                    Id = b.Id,
                    Codigo = b.Codigo,
                    Texto = tr.texto,
                    Orden = tr.orden
                }
            ).ToListAsync();
        }

        private IQueryable<IParametricaBase> ResolveBase(string entidad)
        {
            return entidad switch
            {
                "TIPO_EVENTO" => _context.ef_tipos_evento
                                    .Select(x => (IParametricaBase)x),

                "DRESS_CODE" => _context.ef_dress_code
                                    .Select(x => (IParametricaBase)x),

                _ => throw new ArgumentException($"Entidad paramétrica no soportada: {entidad}")
            };
        }
    }
}
