using API.DataSchema.DTO.Staff;
using API.Security;
using API.Services.Cuentas;
using API.Services.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("cuenta/{id_cuenta}/staff")]
    [Authorize]
    public class staffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly ICuentaContextService _cuentaContext;

        public staffController(IStaffService staffService, ICuentaContextService cuentaContext)
        {
            _staffService  = staffService;
            _cuentaContext = cuentaContext;
        }

        // ─────────────────────────────────────────────
        // GET /cuenta/{id_cuenta}/staff
        // Lista todo el personal de la cuenta
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult> GetAll(long id_cuenta)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            var lista = await _staffService.ListarStaffAsync(id_cuenta);
            return Ok(lista);
        }

        // ─────────────────────────────────────────────
        // POST /cuenta/{id_cuenta}/staff
        // Genera un nuevo código de acceso para un empleado
        // ─────────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult> Create(long id_cuenta, [FromBody] CrearStaffRequest req)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            req.id_cuenta = id_cuenta;

            try
            {
                var resultado = await _staffService.CrearStaffAsync(req);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─────────────────────────────────────────────
        // DELETE /cuenta/{id_cuenta}/staff/{id_staff}
        // Revoca el acceso del empleado (activo = false)
        // ─────────────────────────────────────────────
        [HttpDelete("{id_staff}")]
        public async Task<ActionResult> Revocar(long id_cuenta, long id_staff)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            var ok = await _staffService.RevocarStaffAsync(id_cuenta, id_staff);
            if (!ok) return NotFound(new { error = "Staff no encontrado en esta cuenta." });

            return Ok(new { ok = true });
        }


        [HttpPut("{id_staff}/renovar")]
        public async Task<ActionResult> Renovar(long id_cuenta, long id_staff, [FromBody] API.DataSchema.DTO.Staff.StaffRenovarRequest req)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            try
            {
                var resultado = await _staffService.RenovarCodigoAsync(id_cuenta, id_staff, req.fecha_expiracion);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id_staff}")]
        public async Task<ActionResult> GetById(long id_cuenta, long id_staff)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            try
            {
                var item = await _staffService.GetByIdAsync(id_cuenta, id_staff);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPut("{id_staff}")]
        public async Task<ActionResult> Update(long id_cuenta, long id_staff, [FromBody] API.DataSchema.DTO.Staff.StaffUpdateRequest req)
        {
            long idUsuario = User.GetUserId();

            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, id_cuenta);
            if (!esAdmin) return Forbid();

            try
            {
                var result = await _staffService.UpdateStaffAsync(id_cuenta, id_staff, req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }



    }


    // ─────────────────────────────────────────────
    // POST /staff/join
    // El empleado solo ingresa su código — sin login previo
    // ─────────────────────────────────────────────
    [ApiController]
    [Route("staff")]
    [AllowAnonymous]
    public class staffJoinController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public staffJoinController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpPost("join")]
        public async Task<ActionResult> Join([FromBody] StaffJoinRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.codigo))
                return BadRequest(new { error = "Debe ingresar un código." });

            try
            {
                var contexto = await _staffService.UsarCodigoAsync(req.codigo.Trim().ToUpper());
                return Ok(contexto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


    }



    public class StaffJoinRequest
    {
        public string codigo { get; set; } = null!;
    }
}

