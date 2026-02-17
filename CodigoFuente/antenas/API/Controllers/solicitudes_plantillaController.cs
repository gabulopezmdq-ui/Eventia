using  API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using  API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class solicitudes_plantillaController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<solicitudes_plantillaController> _logger;
        private readonly IEventoPlantillasService _service;

        public solicitudes_plantillaController(
            DataContext context,
            ILogger<solicitudes_plantillaController> logger,
            IEventoPlantillasService service)
        {
            _context = context;
            _logger = logger;
            _service = service;
        }

        // -------------------------
        // USER
        // -------------------------

        public class SolicitudPlantillaCreateRequest
        {
            public long id_evento { get; set; }
            public int id_tipo_evento { get; set; }
            public short? id_plantilla_referida { get; set; }
            public string? motivo { get; set; }
            public string? detalle { get; set; }
            public JsonDocument payload { get; set; } = null!;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] SolicitudPlantillaCreateRequest req)
        {
            if (req.id_evento <= 0) throw new InvalidOperationException("id_evento obligatorio.");
            if (req.id_tipo_evento <= 0) throw new InvalidOperationException("id_tipo_evento obligatorio.");
            if (req.payload == null)
                throw new InvalidOperationException("payload obligatorio.");

            if (req.payload.RootElement.ValueKind == JsonValueKind.Null ||
                req.payload.RootElement.ValueKind == JsonValueKind.Undefined)
                throw new InvalidOperationException("payload obligatorio.");

            if (req.payload.RootElement.ValueKind == JsonValueKind.Object &&
                !req.payload.RootElement.EnumerateObject().Any())
                throw new InvalidOperationException("payload no puede ser un objeto vacío.");

            var idUsuario = User.GetUserId();

            // Opcional: validar que el evento sea del usuario (recomendado)
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == req.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var now = DateTimeOffset.UtcNow;

            var ent = new ef_solicitudes_plantilla
            {
                id_evento = req.id_evento,
                id_tipo_evento = req.id_tipo_evento,
                id_plantilla_referida = req.id_plantilla_referida,
                motivo = string.IsNullOrWhiteSpace(req.motivo) ? null : req.motivo.Trim(),
                detalle = string.IsNullOrWhiteSpace(req.detalle) ? null : req.detalle.Trim(),
                payload = req.payload.RootElement.GetRawText(),
                estado = "P",
                id_usuario_solicita = idUsuario,
                fecha_alta = now,
                fecha_revision = null,
                id_usuario_revisa = null,
                observaciones_admin = null,
                evento = null
            };

            _context.Set<ef_solicitudes_plantilla>().Add(ent);
            await _context.SaveChangesAsync();

            return Ok(ent);
        }

        [Authorize]
        [HttpGet("mias")]
        public async Task<IActionResult> Mias([FromQuery] string? estado = null)
        {
            var idUsuario = User.GetUserId();

            var q = _context.Set<ef_solicitudes_plantilla>()
                .AsNoTracking()
                .Where(x => x.id_usuario_solicita == idUsuario);

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(x => x.estado == estado);

            var data = await q.OrderByDescending(x => x.fecha_alta).ToListAsync();
            return Ok(data);
        }

        // -------------------------
        // ADMIN
        // -------------------------

        [Authorize(Roles = "SUPERADMIN")]
        [HttpGet("listar")]
        public async Task<IActionResult> Listar([FromQuery] string? estado = null, [FromQuery] int? idTipoEvento = null)
        {
            var q = _context.Set<ef_solicitudes_plantilla>()
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(x => x.estado == estado);

            if (idTipoEvento.HasValue)
                q = q.Where(x => x.id_tipo_evento == idTipoEvento.Value);

            var data = await q.OrderByDescending(x => x.fecha_alta).ToListAsync();
            return Ok(data);
        }

        public class SolicitudPlantillaRevisarRequest
        {
            public string estado { get; set; } = null!; // "A" o "R"
            public string? observaciones_admin { get; set; }
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpPut("{idSolicitud:long}/revisar")]
        public async Task<IActionResult> Revisar(long idSolicitud, [FromBody] SolicitudPlantillaRevisarRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.estado) || req.estado.Length != 1)
                throw new InvalidOperationException("estado inválido.");

            if (req.estado != "A" && req.estado != "R")
                throw new InvalidOperationException("estado debe ser A (aprobada) o R (rechazada).");

            var ent = await _context.Set<ef_solicitudes_plantilla>()
                .SingleOrDefaultAsync(x => x.id_solicitud == idSolicitud);

            if (ent == null) return NotFound();

            ent.estado = req.estado;
            ent.observaciones_admin = string.IsNullOrWhiteSpace(req.observaciones_admin) ? null : req.observaciones_admin.Trim();
            ent.fecha_revision = DateTimeOffset.UtcNow;
            ent.id_usuario_revisa = User.GetUserId();

            await _context.SaveChangesAsync();
            return Ok(ent);
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpPost("{idSolicitud:long}/convertir")]
        public async Task<IActionResult> ConvertirEnPlantilla(long idSolicitud, [FromBody] ConvertirSolicitudPlantillaRequestDTO req)
        {
            long idUsuarioAdmin = User.GetUserId();

            var idPlantilla = await _service.ConvertirSolicitudEnPlantillaAsync(
                idSolicitud: idSolicitud,
                codigo: req.codigo,
                idUsuarioAdmin: idUsuarioAdmin,
                observacionesAdmin: req.observaciones_admin,
                activo: req.activo
            );

            return Ok(new { ok = true, id_plantilla = idPlantilla });
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpGet("pendientes")]
        public async Task<IActionResult> GetPendientes([FromQuery] int? idTipoEvento = null)
        {
            var q = _context.Set<ef_solicitudes_plantilla>()
                .AsNoTracking()
                .Where(x => x.estado == "P");

            if (idTipoEvento.HasValue)
                q = q.Where(x => x.id_tipo_evento == idTipoEvento.Value);

            var data = await q.OrderByDescending(x => x.fecha_alta).ToListAsync();
            return Ok(data);
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpGet("{idSolicitud:long}")]
        public async Task<IActionResult> GetById(long idSolicitud)
        {
            var ent = await _context.Set<ef_solicitudes_plantilla>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_solicitud == idSolicitud);

            if (ent == null) return NotFound();
            return Ok(ent);
        }


    }
}