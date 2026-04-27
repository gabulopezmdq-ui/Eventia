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

        public cuenta_usuariosController(
            DataContext context,
            ILogger<cuenta_usuariosController> logger,
            ICRUDService<ef_cuenta_usuarios> serviceGenerico,
            ICuentaContextService cuentaContext)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _cuentaContext = cuentaContext;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_cuenta_usuarios>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_cuenta_usuarios>>> GetByVigente([FromQuery] string activo = null)
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
        public async Task<ActionResult> MisUsuarios()
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

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
    }
}