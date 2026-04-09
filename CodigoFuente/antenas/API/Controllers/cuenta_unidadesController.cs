using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services.Cuentas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class cuenta_unidadesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<cuenta_unidadesController> _logger;
        private readonly ICuentaContextService _cuentaContext;

        public cuenta_unidadesController(
            DataContext context,
            ILogger<cuenta_unidadesController> logger,
            ICuentaContextService cuentaContext)
        {
            _context = context;
            _logger = logger;
            _cuentaContext = cuentaContext;
        }

        [HttpGet("MisUnidades")]
        public async Task<ActionResult> MisUnidades([FromQuery] bool soloActivas = true)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var q = _context.Set<ef_cuenta_unidades>().AsNoTracking()
                .Where(x => x.id_cuenta == idCuenta);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            var list = await q
                .OrderBy(x => x.nombre)
                .Select(x => new CuentaUnidadDTO
                {
                    id_unidad = x.id_unidad,
                    codigo = x.codigo,
                    nombre = x.nombre,
                    descripcion = x.descripcion,
                    activo = x.activo
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CuentaUnidadCreateRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.codigo))
                return BadRequest("Código obligatorio.");
            if (string.IsNullOrWhiteSpace(req.nombre))
                return BadRequest("Nombre obligatorio.");

            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            // Solo admin de cuenta puede ABM (si querés permitir staff, sacá esto)
            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, idCuenta);
            if (!esAdmin) return Forbid();

            bool existe = await _context.Set<ef_cuenta_unidades>()
                .AnyAsync(x => x.id_cuenta == idCuenta && x.codigo == req.codigo);

            if (existe)
                return BadRequest("Ya existe una unidad con ese código en tu cuenta.");

            var now = DateTimeOffset.UtcNow;

            var entidad = new ef_cuenta_unidades
            {
                id_cuenta = idCuenta,
                codigo = req.codigo.Trim(),
                nombre = req.nombre.Trim(),
                descripcion = string.IsNullOrWhiteSpace(req.descripcion) ? null : req.descripcion.Trim(),
                activo = true,
                fecha_alta = now
            };

            _context.Set<ef_cuenta_unidades>().Add(entidad);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_unidad = entidad.id_unidad });
        }

        [HttpPut]
        public async Task<ActionResult> Update([FromBody] CuentaUnidadUpdateRequestDTO req)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, idCuenta);
            if (!esAdmin) return Forbid();

            var unidad = await _context.Set<ef_cuenta_unidades>()
                .SingleOrDefaultAsync(x => x.id_unidad == req.id_unidad && x.id_cuenta == idCuenta);

            if (unidad == null) return NotFound("Unidad inexistente.");

            if (string.IsNullOrWhiteSpace(req.codigo))
                return BadRequest("Código obligatorio.");
            if (string.IsNullOrWhiteSpace(req.nombre))
                return BadRequest("Nombre obligatorio.");

            bool existeOtro = await _context.Set<ef_cuenta_unidades>()
                .AnyAsync(x => x.id_cuenta == idCuenta && x.codigo == req.codigo && x.id_unidad != req.id_unidad);

            if (existeOtro)
                return BadRequest("Ya existe otra unidad con ese código.");

            unidad.codigo = req.codigo.Trim();
            unidad.nombre = req.nombre.Trim();
            unidad.descripcion = string.IsNullOrWhiteSpace(req.descripcion) ? null : req.descripcion.Trim();
            unidad.activo = req.activo;
            unidad.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { ok = true });
        }

        [HttpPut("SetActivo")]
        public async Task<ActionResult> SetActivo([FromQuery] long idUnidad, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, idCuenta);
            if (!esAdmin) return Forbid();

            var unidad = await _context.Set<ef_cuenta_unidades>()
                .SingleOrDefaultAsync(x => x.id_unidad == idUnidad && x.id_cuenta == idCuenta);

            if (unidad == null) return NotFound("Unidad inexistente.");

            unidad.activo = activo;
            unidad.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { ok = true });
        }
    }
}