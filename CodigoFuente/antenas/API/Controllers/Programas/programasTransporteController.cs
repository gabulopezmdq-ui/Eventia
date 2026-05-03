using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    [Authorize]
    public class programasTransporteController : ControllerBase
    {
        private readonly DataContext _context;

        public programasTransporteController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/transporte/dia")]
        public async Task<ActionResult<ProgramaTransporteDiaDTO>> GetTransporteDia(
            long idEvento,
            [FromQuery] DateOnly fecha)
        {
            var servicioCodigo = "TRANSPORTE";

            var baseItems = await (
                from sd in _context.Set<ef_programa_inscripcion_servicio_dias>().AsNoTracking()
                join s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                    on sd.id_inscripcion_servicio equals s.id_inscripcion_servicio
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on s.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                join insc in _context.Set<ef_programa_inscripciones>().AsNoTracking()
                    on s.id_inscripcion equals insc.id_inscripcion
                where insc.id_evento == idEvento
                      && insc.activo == true
                      && sd.activo == true
                      && s.activo == true
                      && sd.fecha == fecha
                      && s.codigo == servicioCodigo
                orderby inv.apellido, inv.nombre
                select new
                {
                    inv.id_invitado,
                    gi.id_rsvp_grupo_integrante,
                    participante = inv.nombre + " " + inv.apellido,
                    responsable = insc.responsable_nombre + " " + insc.responsable_apellido,
                    telefono_responsable = insc.responsable_telefono,
                    servicio = s.nombre,
                    //direccion = s.campos_extra, // futuro: dirección
                    //observaciones_servicio = s.observaciones // a futuro tambien
                    direccion = (string?)null,
                    observaciones_servicio = (string?)null
                }
            ).ToListAsync();

            var idsIntegrantes = baseItems
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var saludRaw = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .ToListAsync();

            var items = baseItems.Select(b =>
            {
                var salud = saludRaw
                    .FirstOrDefault(x => x.id_rsvp_grupo_integrante == b.id_rsvp_grupo_integrante);

                var tieneAlertaSalud =
                    (salud?.tiene_problema_medico == true) ||
                    (salud?.tiene_alergias_no_alimentarias == true);

                var observacionesSalud = salud == null
                    ? null
                    : string.Join(" | ", new[]
                    {
                        salud.tiene_problema_medico == true ? salud.problema_medico_detalle : null,
                        salud.tiene_alergias_no_alimentarias == true ? salud.alergias_no_alimentarias_detalle : null,
                        salud.necesidad_especial,
                        salud.observaciones_familia
                    }.Where(x => !string.IsNullOrWhiteSpace(x)));

                return new ProgramaTransporteItemDTO
                {
                    IdInvitado = b.id_invitado,
                    IdRsvpGrupoIntegrante = b.id_rsvp_grupo_integrante,
                    Participante = b.participante,
                    Responsable = b.responsable,
                    TelefonoResponsable = b.telefono_responsable,
                    Servicio = b.servicio,
                    //Direccion = b.direccion,
                    //ObservacionesServicio = b.observaciones_servicio,
                    TieneAlertaSalud = tieneAlertaSalud,
                    ObservacionesSalud = observacionesSalud
                };
            })
            .OrderByDescending(x => x.TieneAlertaSalud)
            .ThenBy(x => x.Participante)
            .ToList();

            var dto = new ProgramaTransporteDiaDTO
            {
                IdEvento = idEvento,
                Fecha = fecha,
                Items = items,
                Resumen = new ProgramaTransporteResumenDTO
                {
                    Total = items.Count,
                    ConObservaciones = items.Count(x => !string.IsNullOrWhiteSpace(x.ObservacionesServicio)),
                    ConAlertasSalud = items.Count(x => x.TieneAlertaSalud)
                }
            };

            return Ok(dto);
        }
    }
}