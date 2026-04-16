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
        public async Task<ActionResult> MisClientes([FromQuery] bool soloActivos = true)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var clientes = await _context.Set<ef_clientes>()
                .AsNoTracking()
                .Where(c => c.id_cuenta == idCuenta && (!soloActivos || c.activo))
                .OrderBy(c => c.nombre_cliente)
                .ToListAsync();

            var idsClientes = clientes.Select(c => c.id_cliente).ToList();

            var relaciones = await (
                from cu in _context.Set<ef_cliente_unidades>().AsNoTracking()
                join u in _context.Set<ef_cuenta_unidades>().AsNoTracking()
                    on cu.id_unidad equals u.id_unidad
                where idsClientes.Contains(cu.id_cliente) && cu.activo
                select new
                {
                    cu.id_cliente,
                    cu.id_unidad,
                    cu.es_principal,
                    unidad_nombre = u.nombre
                }
            ).ToListAsync();

            var result = clientes.Select(c =>
            {
                var rels = relaciones.Where(r => r.id_cliente == c.id_cliente).ToList();
                var principal = rels.FirstOrDefault(r => r.es_principal);

                return new ClienteDTO
                {
                    id_cliente = c.id_cliente,
                    nombre_cliente = c.nombre_cliente,
                    email = c.email,
                    telefono = c.telefono,
                    notas = c.notas,
                    id_unidad_principal = principal != null ? principal.id_unidad : (long?)null,
                    unidad_principal = principal != null ? principal.unidad_nombre : null,
                    unidades = rels.Select(r => r.unidad_nombre).Distinct().ToList(),
                    activo = c.activo
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("combo")]
        public async Task<ActionResult> Combo([FromQuery] bool soloActivos = true)
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var clientes = await _context.Set<ef_clientes>()
                .AsNoTracking()
                .Where(c => c.id_cuenta == idCuenta && (!soloActivos || c.activo))
                .OrderBy(c => c.nombre_cliente)
                .ToListAsync();

            var idsClientes = clientes.Select(c => c.id_cliente).ToList();

            var relaciones = await (
                from cu in _context.Set<ef_cliente_unidades>().AsNoTracking()
                join u in _context.Set<ef_cuenta_unidades>().AsNoTracking()
                    on cu.id_unidad equals u.id_unidad
                where idsClientes.Contains(cu.id_cliente) && cu.activo
                select new
                {
                    cu.id_cliente,
                    cu.id_unidad,
                    cu.es_principal,
                    unidad_nombre = u.nombre
                }
            ).ToListAsync();

            var result = clientes.Select(c =>
            {
                var rels = relaciones.Where(r => r.id_cliente == c.id_cliente).ToList();
                var principal = rels.FirstOrDefault(r => r.es_principal);

                return new ClienteComboDTO
                {
                    id_cliente = c.id_cliente,
                    nombre_cliente = c.nombre_cliente,
                    email = c.email,
                    telefono = c.telefono,
                    id_unidad_principal = principal != null ? principal.id_unidad : (long?)null,
                    unidad_principal = principal != null ? principal.unidad_nombre : null,
                    unidades = rels.Select(r => r.unidad_nombre).Distinct().ToList(),
                    activo = c.activo
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ClienteCreateRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.nombre_cliente))
                return BadRequest("Nombre obligatorio.");

            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            bool okUnidad = await _cuentaContext.UnidadPerteneceACuentaAsync(idCuenta, req.id_unidad_principal);
            if (!okUnidad) return BadRequest("Unidad principal inválida o inactiva.");

            var now = DateTimeOffset.UtcNow;

            await using var tx = await _context.Database.BeginTransactionAsync();

            var c = new ef_clientes
            {
                id_cuenta = idCuenta,
                nombre_cliente = req.nombre_cliente.Trim(),
                email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim(),
                telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim(),
                notas = string.IsNullOrWhiteSpace(req.notas) ? null : req.notas.Trim(),
                activo = true,
                fecha_alta = now
            };

            _context.Set<ef_clientes>().Add(c);
            await _context.SaveChangesAsync();

            _context.Set<ef_cliente_unidades>().Add(new ef_cliente_unidades
            {
                id_cliente = c.id_cliente,
                id_unidad = req.id_unidad_principal,
                es_principal = true,
                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

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

            bool okUnidad = await _cuentaContext.UnidadPerteneceACuentaAsync(idCuenta, req.id_unidad_principal);
            if (!okUnidad) return BadRequest("Unidad principal inválida o inactiva.");

            c.nombre_cliente = req.nombre_cliente.Trim();
            c.email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim();
            c.telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim();
            c.notas = string.IsNullOrWhiteSpace(req.notas) ? null : req.notas.Trim();
            c.activo = req.activo;
            c.fecha_modif = DateTimeOffset.UtcNow;

            var relaciones = await _context.Set<ef_cliente_unidades>()
                .Where(x => x.id_cliente == c.id_cliente && x.activo)
                .ToListAsync();

            foreach (var rel in relaciones)
            {
                rel.es_principal = false;
                rel.fecha_modif = DateTimeOffset.UtcNow;
            }

            var principal = relaciones.FirstOrDefault(x => x.id_unidad == req.id_unidad_principal);

            if (principal == null)
            {
                _context.Set<ef_cliente_unidades>().Add(new ef_cliente_unidades
                {
                    id_cliente = c.id_cliente,
                    id_unidad = req.id_unidad_principal,
                    es_principal = true,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }
            else
            {
                principal.es_principal = true;
                principal.activo = true;
                principal.fecha_modif = DateTimeOffset.UtcNow;
            }

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