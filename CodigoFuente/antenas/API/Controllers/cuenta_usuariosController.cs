using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using API.Services.Cuentas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema.DTO.Cuentas;


namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class cuenta_usuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_cuenta_usuarios> _serviceGenerico;
        private readonly ILogger<cuenta_usuariosController> _logger;
        private readonly ICuentaContextService _cuentaContext;
        private readonly ICuentaUsuariosService _cuentaUsuariosService;

        public cuenta_usuariosController(
            DataContext context,
            ILogger<cuenta_usuariosController> logger,
            ICRUDService<ef_cuenta_usuarios> serviceGenerico,
            ICuentaContextService cuentaContext,
            ICuentaUsuariosService cuentaUsuariosService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _cuentaContext = cuentaContext;
            _cuentaUsuariosService = cuentaUsuariosService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_cuenta_usuarios>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_cuenta_usuarios>>> GetByVigente([FromQuery] string? activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_cuenta_usuarios>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_cuenta_usuarios cuenta_usr)
        {
            await _serviceGenerico.Add(cuenta_usr);
            return Ok(cuenta_usr);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_cuenta_usuarios>> Update([FromBody] ef_cuenta_usuarios cuenta_usr)
        {
            await _serviceGenerico.Update(cuenta_usr);
            return Ok(cuenta_usr);
        }

        [HttpGet("MisUsuarios")]
        public async Task<ActionResult> MisUsuarios([FromQuery] long idCuenta)
        {
            long idUsuario = User.GetUserId();

            var pertenece = await _context.Set<ef_cuenta_usuarios>()
                .AsNoTracking()
                .AnyAsync(x =>
                    x.id_cuenta == idCuenta &&
                    x.id_usuario == idUsuario &&
                    x.activo);

            if (!pertenece)
                return Unauthorized("No tenés acceso a esta cuenta.");

            var q =
                from cu in _context.Set<ef_cuenta_usuarios>().AsNoTracking()
                join u in _context.Set<ef_usuarios>().AsNoTracking()
                    on cu.id_usuario equals u.id_usuario
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on cu.id_rol equals r.id_rol
                where cu.id_cuenta == idCuenta
                orderby cu.fecha_alta descending
                select new CuentaUsuarioDTO
                {
                    id_cuenta_usuario = cu.id_cuenta_usuario,
                    id_usuario = u.id_usuario,
                    nombre = u.nombre,
                    apellido = u.apellido,
                    email = u.email,
                    rol_cuenta = r.codigo,
                    activo = cu.activo,
                    fecha_alta = cu.fecha_alta
                };

            return Ok(await q.ToListAsync());
        }

        [HttpPost("Invitar")]
        public async Task<ActionResult> Invitar(
            [FromQuery] long idCuenta,
            [FromBody] CuentaUsuarioInvitarRequestDTO request)
        {
            long idUsuario = User.GetUserId();

            var result = await _cuentaUsuariosService
                .InvitarAsync(idUsuario, idCuenta, request);

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("ValidarInvitacion")]
        public async Task<ActionResult> ValidarInvitacion([FromQuery] string token)
        {
            var result =
                await _cuentaUsuariosService
                    .ValidarInvitacionAsync(token);

            return Ok(result);
        }

        [HttpPost("AceptarInvitacion")]
        public async Task<ActionResult> AceptarInvitacion([FromBody] CuentaUsuarioAceptarInvitacionRequestDTO request)
        {
            long idUsuario = User.GetUserId();

            var result =
                await _cuentaUsuariosService
                    .AceptarInvitacionAsync(
                        idUsuario,
                        request.token);

            return Ok(result);
        }

        [HttpPut("CambiarRol")]
        public async Task<ActionResult> CambiarRol(
            [FromQuery] long idCuenta,
            [FromBody] CuentaUsuarioCambiarRolRequestDTO request)
        {
            long idUsuario = User.GetUserId();

            var result = await _cuentaUsuariosService
                .CambiarRolAsync(idUsuario, idCuenta, request);

            return Ok(result);
        }

        [HttpPut("SetActivo")]
        public async Task<ActionResult> SetActivo(
            [FromQuery] long idCuenta,
            [FromQuery] long idCuentaUsuario,
            [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var result = await _cuentaUsuariosService
                .SetActivoAsync(idUsuario, idCuenta, idCuentaUsuario, activo);

            return Ok(result);
        }

    }
}
