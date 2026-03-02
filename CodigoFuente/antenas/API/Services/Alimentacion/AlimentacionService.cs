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
    public class AlimentacionService : IAlimentacionService
    {
        private readonly DataContext _context;

        public AlimentacionService(DataContext context)
        {
            _context = context;
        }

        public async Task UpdateNinoAlimentacionFromPersonalAsync(string rsvpToken, long idInvitadoNino, NinoAlimentacionUpdateDTO dto)
        {
            var titular = await _context.Set<ef_invitados>()
                .SingleOrDefaultAsync(x => x.rsvp_token == rsvpToken);

            if (titular == null) throw new ArgumentException("Link inválido.");

            // titular debe ser responsable
            var rolTitular = await _context.Set<ef_rsvp_grupo_integrantes>()
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo == titular.id_rsvp_grupo && x.id_invitado == titular.id_invitado)
                .Select(x => x.rol_evento)
                .SingleOrDefaultAsync();

            if (rolTitular != "R")
                throw new InvalidOperationException("Solo el responsable puede editar alimentación.");

            // niño debe ser del mismo grupo y rol N
            var integNino = await _context.Set<ef_rsvp_grupo_integrantes>()
                .SingleOrDefaultAsync(x => x.id_rsvp_grupo == titular.id_rsvp_grupo
                                           && x.id_invitado == idInvitadoNino
                                           && x.rol_evento == "N");

            if (integNino == null)
                throw new InvalidOperationException("El niño no pertenece al grupo o no es menor.");

            // validar ids existen en catálogo
            var ids = dto.IdsRestricciones?.Distinct().ToList() ?? new List<long>();
            if (ids.Count > 0)
            {
                var validas = await _context.Set<ef_param_restricciones_alimentarias>()
                    .AsNoTracking()
                    .Where(r => r.activo && ids.Contains(r.id_restriccion_alim))
                    .Select(r => r.id_restriccion_alim)
                    .ToListAsync();

                if (validas.Count != ids.Count)
                    throw new ArgumentException("Alguna restricción es inválida.");
            }

            // actualizar detalle libre
            integNino.alimentacion_detalle = string.IsNullOrWhiteSpace(dto.Detalle) ? null : dto.Detalle.Trim();

            // reemplazar m2m (simple y consistente)
            var existentes = await _context.Set<ef_rsvp_integrante_restricciones>()
                .Where(x => x.id_rsvp_grupo_integrante == integNino.id_rsvp_grupo_integrante)
                .ToListAsync();

            _context.RemoveRange(existentes);

            foreach (var idRestr in ids)
            {
                _context.Add(new ef_rsvp_integrante_restricciones
                {
                    id_rsvp_grupo_integrante = integNino.id_rsvp_grupo_integrante,
                    id_restriccion_alim = idRestr,
                    observaciones = null
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<NinoAlertaStaffDTO>> ListNinosAlertasAsync(long idEvento, short minSeveridad = 4)
        {
            // niños confirmados
            var ninos = await (
                from rgiN in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join invN in _context.Set<ef_invitados>().AsNoTracking()
                    on rgiN.id_invitado equals invN.id_invitado
                where invN.id_evento == idEvento
                      && invN.rsvp_estado == "Y"
                      && rgiN.rol_evento == "N"
                select new { rgiN, invN }
            ).ToListAsync();

            if (ninos.Count == 0) return new();

            var idsIntegrantes = ninos.Select(x => x.rgiN.id_rsvp_grupo_integrante).ToList();
            var idsGrupos = ninos.Select(x => x.invN.id_rsvp_grupo).Where(x => x != null).Select(x => x!.Value).Distinct().ToList();

            // responsable por grupo
            var responsables = await (
                from rgiR in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join invR in _context.Set<ef_invitados>().AsNoTracking()
                    on rgiR.id_invitado equals invR.id_invitado
                where invR.id_evento == idEvento
                      && invR.id_rsvp_grupo != null
                      && idsGrupos.Contains(invR.id_rsvp_grupo.Value)
                      && rgiR.rol_evento == "R"
                select new { IdGrupo = invR.id_rsvp_grupo!.Value, invR.nombre, invR.apellido, invR.celular }
            ).ToListAsync();

            var respDict = responsables.GroupBy(x => x.IdGrupo).ToDictionary(g => g.Key, g => g.First());

            // alertas por integrante (join m2m + catálogo)
            var alertas = await (
                    from rir in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                    join cat in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                        on rir.id_restriccion_alim equals cat.id_restriccion_alim
                    where idsIntegrantes.Contains(rir.id_rsvp_grupo_integrante)
                          && cat.activo
                    select new
                    {
                        rir.id_rsvp_grupo_integrante,
                        cat.id_restriccion_alim,
                        cat.codigo
                    }
                ).ToListAsync();



            // armar salida solo para los que tienen alertas o detalle
            var res = new List<NinoAlertaStaffDTO>();

            

            return res.OrderByDescending(x => x.Apellido).ThenBy(x => x.Nombre).ToList();
        }

        public async Task<List<RestriccionAlimDTO>> GetCatalogoAsync(bool soloActivas = true)
        {
            var q = _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking();

            if (soloActivas)
                q = q.Where(x => x.activo);

            return await q
                .OrderBy(x => x.orden)
                .Select(x => new RestriccionAlimDTO
                {
                    IdRestriccionAlim = x.id_restriccion_alim,
                    Codigo = x.codigo,
                    Nombre = x.codigo
                })
                .ToListAsync();
        }
    }
}