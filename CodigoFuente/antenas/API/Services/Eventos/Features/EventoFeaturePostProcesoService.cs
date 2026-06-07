using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos.Features
{
    public class EventoFeaturePostProcesoService : IEventoFeaturePostProcesoService
    {
        private readonly DataContext _context;

        public EventoFeaturePostProcesoService(DataContext context)
        {
            _context = context;
        }

        public async Task SincronizarAsync(long idEvento)
        {
            var evento = await _context.ef_eventos
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                throw new Exception("No existe el evento.");

            await SincronizarVisibilidadAsync(idEvento);
            await SincronizarPortalConfigAsync(idEvento, evento.tipo_operacion);
        }

        private async Task SincronizarVisibilidadAsync(long idEvento)
        {
            var featuresActivas = await (
                from ef in _context.ef_evento_features
                join f in _context.ef_param_features
                    on ef.id_feature equals f.id_feature
                where ef.id_evento == idEvento
                   && ef.activo == true
                   && f.activo == true
                select new
                {
                    ef.id_feature,
                    f.visible_acceso_evento_default,
                    f.visible_centro_evento_default,
                    f.visible_acceso_programa_default,
                    f.visible_centro_programa_default
                }
            ).ToListAsync();

            foreach (var f in featuresActivas)
            {
                var existe = await _context.ef_evento_feature_visibilidad
                    .FirstOrDefaultAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_feature == f.id_feature);

                if (existe == null)
                {
                    var entity = new ef_evento_feature_visibilidad
                    {
                        id_evento = idEvento,
                        id_feature = f.id_feature,
                        visible_acceso_evento = f.visible_acceso_evento_default,
                        visible_centro_evento = f.visible_centro_evento_default,
                        visible_acceso_programa = f.visible_acceso_programa_default,
                        visible_centro_programa = f.visible_centro_programa_default,
                        fecha_alta = DateTime.UtcNow
                    };

                    _context.ef_evento_feature_visibilidad.Add(entity);
                }
                else
                {
                    // Solo completa defaults si estaban null.
                    // No pisa cambios manuales del organizador.
                    bool huboCambio = false;

                    if (existe.visible_acceso_evento == null)
                    {
                        existe.visible_acceso_evento = f.visible_acceso_evento_default;
                        huboCambio = true;
                    }

                    if (existe.visible_centro_evento == null)
                    {
                        existe.visible_centro_evento = f.visible_centro_evento_default;
                        huboCambio = true;
                    }

                    if (existe.visible_acceso_programa == null)
                    {
                        existe.visible_acceso_programa = f.visible_acceso_programa_default;
                        huboCambio = true;
                    }

                    if (existe.visible_centro_programa == null)
                    {
                        existe.visible_centro_programa = f.visible_centro_programa_default;
                        huboCambio = true;
                    }

                    if (huboCambio)
                        existe.fecha_modif = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task SincronizarPortalConfigAsync(long idEvento, string tipoOperacion)
        {
            bool esPrograma = string.Equals(tipoOperacion, "PROGRAMA", StringComparison.OrdinalIgnoreCase);
            bool esEvento = !esPrograma;

            var secciones = await _context.ef_param_portal_secciones
                .Where(s =>
                    s.activo == true &&
                    (
                        (esEvento && s.aplica_evento == true) ||
                        (esPrograma && s.aplica_programa == true)
                    ))
                .ToListAsync();

            foreach (var s in secciones)
            {
                bool featureOk = true;

                if (!string.IsNullOrWhiteSpace(s.requiere_feature_codigo))
                {
                    featureOk = await (
                        from ef in _context.ef_evento_features
                        join f in _context.ef_param_features
                            on ef.id_feature equals f.id_feature
                        where ef.id_evento == idEvento
                           && ef.activo == true
                           && f.activo == true
                           && f.codigo == s.requiere_feature_codigo
                        select ef.id_evento_feature
                    ).AnyAsync();
                }

                if (!featureOk)
                    continue;

                var existe = await _context.ef_evento_portal_config
                    .FirstOrDefaultAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_portal_seccion == s.id_portal_seccion);

                if (existe == null)
                {
                    var entity = new ef_evento_portal_config
                    {
                        id_evento = idEvento,
                        id_portal_seccion = s.id_portal_seccion,
                        visible = true,
                        orden = s.orden_default,
                        titulo_override = null,
                        config_json = null,
                        activo = true,
                        fecha_alta = DateTime.UtcNow
                    };

                    _context.ef_evento_portal_config.Add(entity);
                }
                else
                {
                    // No pisa visible si el organizador lo apagó.
                    // Solo reactiva config inactiva técnica.
                    existe.activo = true;

                    if (existe.orden <= 0)
                        existe.orden = s.orden_default;

                    existe.fecha_modif = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}