using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.Interfaz;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
        private async Task<List<ParametricaDTO>> GetParametricaAsync<TEntity>(
            IQueryable<TEntity> baseQuery,
            string entidad,
            Expression<Func<TEntity, long>> idSelector,
            Expression<Func<TEntity, string>> codigoSelector,
            Expression<Func<TEntity, bool>> activoSelector,
            short idIdioma)
            where TEntity : class
        {
            var query =
                from b in baseQuery.Where(activoSelector)
                join tr in _context.ef_param_traducciones
                    on EF.Property<long>(b, ((MemberExpression)idSelector.Body).Member.Name)
                    equals tr.id_item
                where tr.entidad == entidad
                   && tr.id_idioma == idIdioma
                   && tr.activo
                orderby tr.orden ?? 999, tr.texto
                select new
                {
                    Id = EF.Property<long>(b, ((MemberExpression)idSelector.Body).Member.Name),
                    Codigo = EF.Property<string>(b, ((MemberExpression)codigoSelector.Body).Member.Name),
                    tr.texto,
                    tr.orden
                };

            var data = await query.ToListAsync();

            return data.Select(x => new ParametricaDTO
            {
                Id = x.Id,
                Codigo = x.Codigo,
                Texto = x.texto,
                Orden = x.orden
            }).ToList();
        }

        public Task<List<ParametricaDTO>> GetTiposEventoAsync(short idIdioma)
            => GetParametricaAsync(
                _context.ef_tipos_evento,
                "TIPO_EVENTO",
                t => t.id_tipo_evento,
                t => t.codigo,
                t => t.activo,
                idIdioma
            );

        public Task<List<ParametricaDTO>> GetDressCodeAsync(short idIdioma)
            => GetParametricaAsync(
                _context.ef_dress_code,
                "DRESS_CODE",
                d => d.id_dress_code,
                d => d.codigo,
                d => d.activo,
                idIdioma
            );
    }
}