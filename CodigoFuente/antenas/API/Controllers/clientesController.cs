using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services.Cuentas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class clientesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICuentaContextService _cuentaContext;

        public clientesController(DataContext context, ICuentaContextService cuentaContext)
        {
            _context = context;
            _cuentaContext = cuentaContext;
        }

        [HttpGet("MisClientes")]
        public async Task<ActionResult> MisClientes([FromQuery] bool soloActivos = true, [FromQuery] long? idUnidad = null)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var q =
                from c in _context.Set<ef_clientes>().AsNoTracking()
                join u in _context.Set<ef_cuenta_unidades>().AsNoTracking()
                    on c.id_unidad equals u.id_unidad into uj
                from u in uj.DefaultIfEmpty()
                where c.id_cuenta == idCuenta
                select new ClienteDTO
                {
                    id_cliente = c.id_cliente,
                    nombre_cliente = c.nombre_cliente,
                    email = c.email,
                    telefono = c.telefono,
                    notas = c.notas,
                    id_unidad = c.id_unidad,
                    unidad_nombre = u != null ? u.nombre : null,
                    activo = c.activo
                };

            if (soloActivos) q = q.Where(x => x.activo == true);
            if (idUnidad.HasValue) q = q.Where(x => x.id_unidad == idUnidad.Value);

            return Ok(await q.OrderBy(x => x.nombre_cliente).ToListAsync());
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ClienteCreateRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.nombre_cliente))
                return BadRequest("Nombre obligatorio.");

            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            // si viene unidad, validarla contra la cuenta
            if (req.id_unidad.HasValue)
            {
                bool okUnidad = await _cuentaContext.UnidadPerteneceACuentaAsync(idCuenta, req.id_unidad.Value);
                if (!okUnidad) return BadRequest("Unidad inválida o inactiva.");
            }

            var now = DateTimeOffset.UtcNow;

            var c = new ef_clientes
            {
                id_cuenta = idCuenta,
                nombre_cliente = req.nombre_cliente.Trim(),
                email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim(),
                telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim(),
                notas = string.IsNullOrWhiteSpace(req.notas) ? null : req.notas.Trim(),
                id_unidad = req.id_unidad,
                activo = true,
                fecha_alta = now
            };

            _context.Set<ef_clientes>().Add(c);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_cliente = c.id_cliente });
        }

        [HttpPut]
        public async Task<ActionResult> Update([FromBody] ClienteUpdateRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.nombre_cliente))
                return BadRequest("Nombre obligatorio.");

            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var c = await _context.Set<ef_clientes>()
                .SingleOrDefaultAsync(x => x.id_cliente == req.id_cliente && x.id_cuenta == idCuenta);

            if (c == null) return NotFound("Cliente inexistente.");

            if (req.id_unidad.HasValue)
            {
                bool okUnidad = await _cuentaContext.UnidadPerteneceACuentaAsync(idCuenta, req.id_unidad.Value);
                if (!okUnidad) return BadRequest("Unidad inválida o inactiva.");
            }

            c.nombre_cliente = req.nombre_cliente.Trim();
            c.email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim();
            c.telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim();
            c.notas = string.IsNullOrWhiteSpace(req.notas) ? null : req.notas.Trim();
            c.id_unidad = req.id_unidad;
            c.activo = req.activo;
            c.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }

        [HttpPut("SetActivo")]
        public async Task<ActionResult> SetActivo([FromQuery] long idCliente, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var c = await _context.Set<ef_clientes>()
                .SingleOrDefaultAsync(x => x.id_cliente == idCliente && x.id_cuenta == idCuenta);

            if (c == null) return NotFound("Cliente inexistente.");

            c.activo = activo;
            c.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }
    }
}
