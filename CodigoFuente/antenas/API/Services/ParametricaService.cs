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

        public async Task<List<ParametricaDTO>> GetTiposEventoAsync(short idIdioma)
        {
            return await (
                from t in _context.ef_tipos_evento
                join tr in _context.ef_param_traducciones
                    on t.id_tipo_evento equals tr.id_item
                where tr.entidad == "TIPO_EVENTO"
                   && tr.id_idioma == idIdioma
                   && tr.activo
                   && t.activo
                orderby tr.orden ?? 999, tr.texto
                select new ParametricaDTO
                {
                    Id = t.id_tipo_evento,
                    Codigo = t.codigo,
                    Texto = tr.texto,
                    Orden = tr.orden
                }
            ).ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetDressCodeAsync(short idIdioma)
        {
            return await (
                from d in _context.ef_dress_code
                join tr in _context.ef_param_traducciones
                    on d.id_dress_code equals tr.id_item
                where tr.entidad == "DRESS_CODE"
                   && tr.id_idioma == idIdioma
                   && tr.activo
                   && d.activo
                orderby tr.orden ?? 999, tr.texto
                select new ParametricaDTO
                {
                    Id = d.id_dress_code,
                    Codigo = d.codigo,
                    Texto = tr.texto,
                    Orden = tr.orden
                }
            ).ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetTramosTipoAsync(short idIdioma)
        {
            return await (
                from d in _context.ef_tramo_tipos
                join tr in _context.ef_param_traducciones
                    on d.id_tramo_tipo equals tr.id_item
                where tr.entidad == "TRAMO_TIPO"
                   && tr.id_idioma == idIdioma
                   && tr.activo
                   && d.activo
                orderby tr.orden ?? 999, tr.texto
                select new ParametricaDTO
                {
                    Id = d.id_tramo_tipo,
                    Codigo = d.codigo,
                    Texto = tr.texto,
                    Orden = tr.orden
                }
            ).ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetPaisesAsync(short idIdioma)
        {
            var query =
                from p in _context.ef_paises
                join t in _context.ef_param_traducciones
                    on new { entidad = "PAIS", id_item = (long)p.id_pais, id_idioma = idIdioma }
                    equals new { t.entidad, t.id_item, t.id_idioma }
                where p.activo && t.activo
                orderby p.orden, t.texto
                select new ParametricaDTO
                {
                    Id = p.id_pais,
                    Codigo = p.codigo_iso2,
                    Texto = t.texto,
                    Orden = p.orden
                };

            return await query.ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetTiposIdentificacionFiscalAsync(short idIdioma)
        {
            var query =
                from x in _context.ef_tipos_identificacion_fiscal
                join t in _context.ef_param_traducciones
                    on new { entidad = "TIPO_IDENTIFICACION_FISCAL", id_item = (long)x.id_tipo_identificacion_fiscal, id_idioma = idIdioma }
                    equals new { t.entidad, t.id_item, t.id_idioma }
                where x.activo && t.activo
                orderby x.orden, t.texto
                select new ParametricaDTO
                {
                    Id = x.id_tipo_identificacion_fiscal,
                    Codigo = x.codigo,
                    Texto = t.texto,
                    Orden = x.orden
                };

            return await query.ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetTiposIdentificacionFiscalByPaisAsync(short idPais, short idIdioma)
        {
            var query =
                from x in _context.ef_tipos_identificacion_fiscal
                join t in _context.ef_param_traducciones
                    on new { entidad = "TIPO_IDENTIFICACION_FISCAL", id_item = (long)x.id_tipo_identificacion_fiscal, id_idioma = idIdioma }
                    equals new { t.entidad, t.id_item, t.id_idioma }
                where x.activo && t.activo && x.id_pais == idPais
                orderby x.orden, t.texto
                select new ParametricaDTO
                {
                    Id = x.id_tipo_identificacion_fiscal,
                    Codigo = x.codigo,
                    Texto = t.texto,
                    Orden = x.orden
                };

            return await query.ToListAsync();
        }

        public async Task<List<ParametricaDTO>> GetTiposBeneficioRegistroAsync(short idIdioma)
        {
            return await GetParametricaAsync(
                _context.ef_param_tipos_beneficio_registro,
                "TIPO_BENEFICIO_REGISTRO",
                x => x.id_tipo_beneficio_registro,
                x => x.codigo,
                x => x.activo,
                idIdioma
            );
        }

        public async Task<List<ParametricaDTO>> GetPerfilesAsistenciaAsync(short idIdioma)
        {
            return await GetParametricaAsync(
                _context.ef_param_perfiles_asistencia,
                "PERFIL_ASISTENCIA",
                x => x.id_perfil_asistencia,
                x => x.codigo,
                x => x.activo,
                idIdioma
            );
        }

        public async Task<List<ParametricaDTO>> GetInteresesEventoPublicoAsync(short idIdioma)
        {
            return await GetParametricaAsync(
                _context.ef_param_intereses_evento_publico,
                "INTERES_EVENTO_PUBLICO",
                x => x.id_interes_evento_publico,
                x => x.codigo,
                x => x.activo,
                idIdioma
            );
        }

        public async Task<List<ParametricaDTO>> GetPreferenciasMusicalesAsync(short idIdioma)
        {
            return await GetParametricaAsync(
                _context.ef_param_preferencias_musicales,
                "PREFERENCIA_MUSICAL",
                x => x.id_preferencia_musical,
                x => x.codigo,
                x => x.activo,
                idIdioma
            );
        }

        public async Task<List<ParametricaDTO>> GetRestriccionesAlimentariasAsync(short idIdioma)
        {
            return await GetParametricaAsync(
                _context.ef_param_restricciones_alimentarias,
                "RESTRICCION_ALIMENTARIA",
                x => x.id_restriccion_alim,
                x => x.codigo,
                x => x.activo,
                idIdioma
            );
        }
    }
}