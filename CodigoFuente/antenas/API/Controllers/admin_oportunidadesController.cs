using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/oportunidades")]
    public class admin_oportunidadesController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_oportunidadesController(DataContext context)
        {
            _context = context;
        }

        // GET /admin/oportunidades/free-trials?soloNoConvertidos=true
        [HttpGet("free-trials")]
        public async Task<ActionResult<List<FreeTrialAdminItemDTO>>> FreeTrials([FromQuery] bool soloNoConvertidos = true)
        {
            var now = DateTimeOffset.UtcNow;

            // 1) id_plan del FREE
            var idPlanFree = await _context.Set<ef_planes>()
                .AsNoTracking()
                .Where(p => p.codigo == "B2C_FREE" && p.activo == true)
                .Select(p => (long?)p.id_plan)
                .FirstOrDefaultAsync();

            if (!idPlanFree.HasValue)
                return Ok(new List<FreeTrialAdminItemDTO>());

            // 2) Traer suscripciones FREE de eventos (nos quedamos con la última por evento)
            //    (Para simplificar y evitar líos con GroupBy SQL, lo hacemos en memoria.
            //     Para piloto/operación admin suele estar bien.)
            var subsFree = await _context.Set<ef_suscripciones>()
                .AsNoTracking()
                .Where(s => s.scope == "EVENTO"
                            && s.activo == true
                            && s.id_evento != null
                            && s.id_plan == idPlanFree.Value)
                .OrderByDescending(s => s.fecha_alta)
                .ToListAsync();

            var ultimaFreePorEvento = subsFree
                .GroupBy(s => s.id_evento!.Value)
                .Select(g => g.First())
                .ToList();

            var eventoIds = ultimaFreePorEvento.Select(x => x.id_evento!.Value).Distinct().ToList();
            if (eventoIds.Count == 0)
                return Ok(new List<FreeTrialAdminItemDTO>());

            // 3) Detectar convertidos: existe suscripción ACTIVA no-FREE posterior para el evento
            var subsPago = await _context.Set<ef_suscripciones>()
                .AsNoTracking()
                .Where(s => s.scope == "EVENTO"
                            && s.activo == true
                            && s.id_evento != null
                            && eventoIds.Contains(s.id_evento.Value)
                            && s.id_plan != idPlanFree.Value
                            && s.estado == "ACTIVA")
                .Select(s => new { id_evento = s.id_evento!.Value, s.fecha_alta })
                .ToListAsync();

            var convertidoSet = new HashSet<long>(subsPago.Select(x => x.id_evento));

            // 4) Datos del evento + tipo + owner (email)
            //    Owner: ef_evento_usuarios con rol EVENT_OWNER
            var idRolOwner = await _context.Set<ef_roles>()
                .AsNoTracking()
                .Where(r => r.codigo == "EVENT_OWNER" && r.activo == true)
                .Select(r => (short?)r.id_rol)
                .FirstOrDefaultAsync();

            short? idRolOwnerVal = idRolOwner;

            var eventosInfo = await (
                from ev in _context.Set<ef_eventos>().AsNoTracking()
                join te in _context.Set<ef_tipos_evento>().AsNoTracking()
                    on ev.id_tipo_evento equals te.id_tipo_evento
                join eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                    on ev.id_evento equals eu.id_evento into euJ
                from eu in euJ.DefaultIfEmpty()
                join u in _context.Set<ef_usuarios>().AsNoTracking()
                    on eu.id_usuario equals u.id_usuario into uJ
                from u in uJ.DefaultIfEmpty()
                where eventoIds.Contains(ev.id_evento)
                      && (idRolOwnerVal == null || eu == null || eu.id_rol == idRolOwnerVal.Value) // si no encuentra rol, no filtra
                      && (eu == null || eu.activo == true)
                select new
                {
                    ev.id_evento,
                    ev.estado,
                    ev.anfitriones_texto,
                    ev.fecha_alta,
                    tipo_evento_codigo = te.codigo,
                    id_usuario_owner = (long?)eu.id_usuario,
                    owner_email = (u != null ? u.email : null)
                }
            ).ToListAsync();

            // Puede haber duplicados si hay más de un eu; nos quedamos con uno por evento (primero)
            var eventosById = eventosInfo
                .GroupBy(x => x.id_evento)
                .ToDictionary(g => g.Key, g => g.First());

            // 5) Armar respuesta
            var resp = new List<FreeTrialAdminItemDTO>();

            foreach (var s in ultimaFreePorEvento)
            {
                var idEvento = s.id_evento!.Value;
                if (!eventosById.TryGetValue(idEvento, out var ev))
                    continue;

                var end = s.current_period_end;
                int? dias = null;
                bool? vencido = null;

                if (end.HasValue)
                {
                    var seconds = (end.Value - now).TotalSeconds;
                    var d = (int)Math.Ceiling(seconds / 86400.0);
                    if (d < 0) d = 0;
                    dias = d;
                    vencido = now >= end.Value;
                }

                var convertido = convertidoSet.Contains(idEvento);

                if (soloNoConvertidos && convertido)
                    continue;

                resp.Add(new FreeTrialAdminItemDTO
                {
                    id_evento = idEvento,
                    evento_estado = ev.estado,

                    tipo_evento_codigo = ev.tipo_evento_codigo,
                    anfitriones_texto = ev.anfitriones_texto,
                    fecha_alta_evento = ev.fecha_alta,

                    plan_codigo = "B2C_FREE",
                    plan_nombre = "B2C Free",

                    trial_fin = end,
                    dias_restantes = dias,
                    vencido = vencido,

                    id_usuario_owner = ev.id_usuario_owner,
                    owner_email = ev.owner_email,

                    convertido_a_pago = convertido
                });
            }

            // orden: vencidos primero o por menos días restantes
            resp = resp
                .OrderBy(x => x.vencido == true ? 0 : 1)
                .ThenBy(x => x.dias_restantes ?? 9999)
                .ThenByDescending(x => x.fecha_alta_evento)
                .ToList();

            return Ok(resp);
        }
    }
}
