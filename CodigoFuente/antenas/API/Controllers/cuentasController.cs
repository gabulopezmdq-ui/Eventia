using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.DTO.Cuentas;
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
    public class cuentasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<cuentasController> _logger;
        private readonly ICuentasService _cuentasService;
        private readonly ICuentaContextService _cuentaContext;

        public cuentasController(
            DataContext context,
            ILogger<cuentasController> logger,
            ICuentasService cuentasService,
            ICuentaContextService cuentaContext)
        {
            _context = context;
            _logger = logger;
            _cuentasService = cuentasService;
            _cuentaContext = cuentaContext;
        }

        [HttpGet("MiCuenta")]
        public async Task<ActionResult<CuentaResponseDTO>> MiCuenta()
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.GetMiCuentaAsync(id_usuario);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al obtener la cuenta del usuario.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al obtener la cuenta del usuario.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al obtener la cuenta del usuario.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }

        [HttpPut("UpdateMiCuenta")]
        public async Task<ActionResult<CuentaResponseDTO>> UpdateMiCuenta([FromBody] CuentaUpdateRequestDTO request)
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.UpdateMiCuentaAsync(id_usuario, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al actualizar la cuenta del usuario.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al actualizar la cuenta del usuario.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al actualizar la cuenta del usuario.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }

        [HttpPost("SolicitarCuenta")]
        public async Task<ActionResult<cuenta_solicitar_response>> SolicitarCuenta([FromBody] cuenta_solicitar_request request)
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.SolicitarCuentaAsync(id_usuario, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al solicitar cuenta.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al solicitar cuenta.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al solicitar cuenta.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }

        [HttpGet("MiPlan")]
        public async Task<ActionResult<MiPlanCuentaDTO>> MiPlan()
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var cuenta = await (
                from c in _context.Set<ef_cuentas>().AsNoTracking()
                join p in _context.Set<ef_planes>().AsNoTracking()
                    on c.id_plan equals p.id_plan into pj
                from p in pj.DefaultIfEmpty()
                where c.id_cuenta == idCuenta
                select new
                {
                    c.id_cuenta,
                    c.nombre_cuenta,
                    c.tipo,
                    c.estado,
                    c.id_plan,
                    plan_codigo = p != null ? p.codigo : null,
                    plan_nombre = p != null ? p.nombre : null
                }
            ).SingleOrDefaultAsync();

            if (cuenta == null)
                return NotFound("Cuenta inexistente.");

            var suscripcion = await _context.Set<ef_suscripciones>()
                .AsNoTracking()
                .Where(s => s.scope == "CUENTA" && s.id_cuenta == idCuenta && s.activo)
                .OrderByDescending(s => s.fecha_alta)
                .FirstOrDefaultAsync();

            var ultimoPago = await _context.Set<ef_pagos>()
                .AsNoTracking()
                .Where(p => p.id_cuenta == idCuenta && p.activo)
                .OrderByDescending(p => p.fecha_alta)
                .FirstOrDefaultAsync();

            var now = DateTimeOffset.UtcNow;

            MiPlanCuentaSuscripcionDTO? suscripcionDto = null;

            if (suscripcion != null)
            {
                int? diasRestantes = null;
                bool vencida = false;

                if (suscripcion.current_period_end.HasValue)
                {
                    var diff = suscripcion.current_period_end.Value.Date - now.Date;
                    diasRestantes = diff.Days;
                    vencida = suscripcion.current_period_end.Value < now;
                }

                suscripcionDto = new MiPlanCuentaSuscripcionDTO
                {
                    scope = suscripcion.scope,
                    estado = suscripcion.estado,
                    periodo = suscripcion.periodo,
                    current_period_start = suscripcion.current_period_start,
                    current_period_end = suscripcion.current_period_end,
                    dias_restantes = diasRestantes,
                    vencida = vencida,
                    auto_renueva = suscripcion.auto_renueva
                };
            }

            var dto = new MiPlanCuentaDTO
            {
                id_cuenta = cuenta.id_cuenta,
                nombre_cuenta = cuenta.nombre_cuenta,
                tipo = cuenta.tipo,
                estado_cuenta = cuenta.estado,
                plan = new MiPlanCuentaPlanDTO
                {
                    id_plan = cuenta.id_plan,
                    codigo = cuenta.plan_codigo,
                    nombre = cuenta.plan_nombre
                },
                suscripcion = suscripcionDto,
                facturacion = new MiPlanCuentaFacturacionDTO
                {
                    pago_pendiente = ultimoPago != null && ultimoPago.estado == "PENDIENTE",
                    ultimo_pago_fecha = ultimoPago?.fecha_alta,
                    ultimo_pago_total = ultimoPago?.total,
                    moneda = ultimoPago?.moneda,
                    proximo_vencimiento = suscripcion?.current_period_end
                }
            };

            return Ok(dto);
        }
    }
}
