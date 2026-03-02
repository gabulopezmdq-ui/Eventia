using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;


namespace API.Services
{
    public class RestriccionesService : IRestriccionesService
    {
        private readonly DataContext _context;

        private const string ENT_NOMBRE = "RESTR_ALIM_NOMBRE";
        private const string ENT_DESC = "RESTR_ALIM_DESC";

        public RestriccionesService(DataContext context)
        {
            _context = context;
        }

        // -------------------------------
        // 1) Catálogo traducido por locale
        // -------------------------------
        public async Task<List<RestriccionCatalogItemDTO>> GetCatalogoAsync(string locale)
        {
            var idioma = await _context.ef_idiomas
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.locale == locale && x.activo);

            if (idioma == null)
                throw new ArgumentException($"Locale inválido o inactivo: {locale}");

            var rows = await (
                from r in _context.ef_param_restricciones_alimentarias.AsNoTracking()
                where r.activo

                join tn in _context.ef_param_traducciones.AsNoTracking()
                    on new { entidad = ENT_NOMBRE, id_item = r.id_restriccion_alim, idioma.id_idioma }
                    equals new { tn.entidad, tn.id_item, tn.id_idioma }
                    into gtn
                from tn in gtn.DefaultIfEmpty()

                join td in _context.ef_param_traducciones.AsNoTracking()
                    on new { entidad = ENT_DESC, id_item = r.id_restriccion_alim, idioma.id_idioma }
                    equals new { td.entidad, td.id_item, td.id_idioma }
                    into gtd
                from td in gtd.DefaultIfEmpty()

                orderby r.orden

                select new
                {
                    r.id_restriccion_alim,
                    r.codigo,
                    Nombre = tn.texto,
                    Descripcion = td.texto,
                    r.categoria,
                    r.icon_key,
                    r.activo,
                    r.orden
                }
            ).ToListAsync();

            // Validación estricta: sin fallback
            var faltantes = rows
                .Where(x => string.IsNullOrWhiteSpace(x.Nombre))
                .Select(x => x.codigo)
                .ToList();

            if (faltantes.Any())
                throw new InvalidOperationException(
                    $"Faltan traducciones ({ENT_NOMBRE}) para locale {locale}. Códigos: {string.Join(", ", faltantes)}");

            return rows.Select(x => new RestriccionCatalogItemDTO
            {
                IdRestriccion = x.id_restriccion_alim,
                Codigo = x.codigo,
                Nombre = x.Nombre!,
                Descripcion = x.Descripcion,
                Categoria = x.categoria,
                IconKey = x.icon_key,
                Activo = x.activo,
                Orden = x.orden
            }).ToList();
        }

        // ---------------------------------------------------
        // 2) Obtener restricciones del grupo del responsable
        // ---------------------------------------------------
        public async Task<RestriccionesGrupoResponseDTO> GetMisRestriccionesAsync(string rsvpToken)
        {
            var titular = await _context.ef_invitados
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.rsvp_token == rsvpToken && x.activo);

            if (titular == null)
                throw new ArgumentException("Link inválido.");

            if (titular.id_rsvp_grupo == null)
                throw new InvalidOperationException("El invitado no pertenece a un grupo RSVP.");

            var idGrupo = titular.id_rsvp_grupo.Value;

            // Validar que es responsable (rol_evento='R')
            var rol = await _context.ef_rsvp_grupo_integrantes
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo == idGrupo && x.id_invitado == titular.id_invitado)
                .Select(x => x.rol_evento)
                .SingleOrDefaultAsync();

            if (rol != "R")
                throw new InvalidOperationException("Solo el responsable puede gestionar restricciones del grupo.");

            // Traer integrantes del grupo (normalmente niños + responsable)
            var integrantes = await _context.ef_rsvp_grupo_integrantes
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo == idGrupo)
                .Select(x => x.id_invitado)
                .ToListAsync();

            // Traer restricciones existentes
            // (Nota: la entidad ef_rsvp_integrante_restricciones debe existir en tu DataContext)
            var restr = await _context.ef_rsvp_integrante_restricciones
                .AsNoTracking()
                .Where(x => integrantes.Contains(x.id_rsvp_grupo_integrante))
                .ToListAsync();

            // Armar response por integrante
            var resp = new RestriccionesGrupoResponseDTO
            {
                IdEvento = titular.id_evento,
                IdGrupo = idGrupo,
                Integrantes = integrantes.Select(idInv => new IntegranteRestriccionesUpsertDTO
                {
                    IdRsvpGrupoIntegrante = idInv,
                    Restricciones = restr
                        .Where(r => r.id_rsvp_grupo_integrante == idInv)
                        .Select(r => new IntegranteRestriccionDTO
                        {
                            IdRestriccion = r.id_restriccion_alim,
                            Observaciones = r.observaciones,
                            Severidad = null // si la columna existe
                        })
                        .ToList()
                }).ToList()
            };

            return resp;
        }

        // ---------------------------------------------------
        // 3) Guardar restricciones (upsert) por integrante
        //    SIN romper flujo: usa rsvp_token del responsable
        // ---------------------------------------------------
        public async Task SaveMisRestriccionesAsync(string rsvpToken, RestriccionesGrupoUpsertDTO dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var titular = await _context.ef_invitados
                .SingleOrDefaultAsync(x => x.rsvp_token == rsvpToken && x.activo);

            if (titular == null)
                throw new ArgumentException("Link inválido.");

            if (titular.id_rsvp_grupo == null)
                throw new InvalidOperationException("El invitado no pertenece a un grupo RSVP.");

            var idGrupo = titular.id_rsvp_grupo.Value;

            // Validar rol responsable
            var rol = await _context.ef_rsvp_grupo_integrantes
                .Where(x => x.id_rsvp_grupo == idGrupo && x.id_invitado == titular.id_invitado)
                .Select(x => x.rol_evento)
                .SingleOrDefaultAsync();

            if (rol != "R")
                throw new InvalidOperationException("Solo el responsable puede guardar restricciones del grupo.");

            // Integrantes válidos del grupo
            var integrantesGrupo = (await _context.ef_rsvp_grupo_integrantes
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo == idGrupo)
                .Select(x => x.id_rsvp_grupo_integrante)
                .ToListAsync())
                .ToHashSet();

            // Validar que los integrantes enviados pertenecen al grupo
            var idsReq = dto.Integrantes.Select(x => x.IdRsvpGrupoIntegrante).Distinct().ToList();
            var invalidos = idsReq.Where(id => !integrantesGrupo.Contains(id)).ToList();
            if (invalidos.Any())
                throw new InvalidOperationException("Hay integrantes que no pertenecen al grupo: " + string.Join(", ", invalidos));

            // Validar restricciones existentes/activas
            var allRestrIds = dto.Integrantes
                .SelectMany(x => x.Restricciones.Select(r => r.IdRestriccion))
                .Distinct()
                .ToList();

            if (allRestrIds.Any())
            {
                var validRestr = await _context.ef_param_restricciones_alimentarias
                    .AsNoTracking()
                    .Where(r => allRestrIds.Contains(r.id_restriccion_alim) && r.activo)
                    .Select(r => r.id_restriccion_alim)
                    .ToListAsync();

                var setValid = validRestr.ToHashSet();
                var invalidRestr = allRestrIds.Where(id => !setValid.Contains(id)).ToList();
                if (invalidRestr.Any())
                    throw new InvalidOperationException("Restricciones inválidas o inactivas: " + string.Join(", ", invalidRestr));
            }

            // Upsert: borramos lo actual de esos integrantes y reinsertamos
            // (no toca tu flujo actual, solo opera en tabla puente)
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1) Borrar existentes
                var existentes = await _context.ef_rsvp_integrante_restricciones
                    .Where(x => idsReq.Contains(x.id_rsvp_grupo_integrante))
                    .ToListAsync();

                if (existentes.Any())
                    _context.ef_rsvp_integrante_restricciones.RemoveRange(existentes);

                // 2) Insertar nuevas
                var nuevas = new List<ef_rsvp_integrante_restricciones>();

                foreach (var integ in dto.Integrantes)
                {
                    foreach (var r in integ.Restricciones)
                    {
                        // Validación severidad opcional
                        var sev = r.Severidad;
                        if (!string.IsNullOrWhiteSpace(sev))
                        {
                            sev = sev.Trim().ToUpperInvariant();
                            if (sev != "L" && sev != "M" && sev != "G")
                                throw new InvalidOperationException($"Severidad inválida para idInvitado={integ.IdRsvpGrupoIntegrante}, idRestriccion={r.IdRestriccion}: {r.Severidad}");
                        }

                        nuevas.Add(new ef_rsvp_integrante_restricciones
                        {
                            id_rsvp_grupo_integrante = integ.IdRsvpGrupoIntegrante,
                            id_restriccion_alim = r.IdRestriccion,
                            observaciones = string.IsNullOrWhiteSpace(r.Observaciones) ? null : r.Observaciones.Trim(),
                            // si tu entidad tiene severidad, se setea; si no, podés quitar esta línea
                            severidad = sev
                        });
                    }
                }

                if (nuevas.Any())
                    _context.ef_rsvp_integrante_restricciones.AddRange(nuevas);

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // Helper: evita romper compilación si aún no agregaste campos en EF
        private static string? SafeGet(Func<string?> getter)
        {
            try { return getter(); }
            catch { return null; }
        }
    }
}