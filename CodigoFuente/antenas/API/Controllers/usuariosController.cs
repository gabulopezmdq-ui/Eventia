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
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class usuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _serviceGenerico;
        private readonly ILogger<usuariosController> _logger;

        public usuariosController(DataContext context, ILogger<usuariosController> logger, ICRUDService<ef_usuarios> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_usuarios>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_usuarios>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_usuarios>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_usuarios usuario)
        {
            await _serviceGenerico.Add(usuario);
            return Ok(usuario);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_usuarios>> Update([FromBody] ef_usuarios usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }

        [HttpGet("mi-perfil")]
        public async Task<ActionResult<MiPerfilDTO>> MiPerfil()
        {
            long idUsuario = User.GetUserId();

            var u = await (
                from usr in _context.Set<ef_usuarios>().AsNoTracking()
                join p in _context.Set<ef_paises>().AsNoTracking()
                    on usr.id_pais equals p.id_pais into pj
                from p in pj.DefaultIfEmpty()
                join ip in _context.Set<ef_idiomas>().AsNoTracking()
                    on usr.id_idioma_preferido equals ip.id_idioma into ipj
                from ip in ipj.DefaultIfEmpty()
                join ide in _context.Set<ef_idiomas>().AsNoTracking()
                    on usr.id_idioma_default_evento equals ide.id_idioma into idej
                from ide in idej.DefaultIfEmpty()
                where usr.id_usuario == idUsuario
                select new
                {
                    usr.id_usuario,
                    usr.email,
                    usr.nombre,
                    usr.apellido,
                    usr.telefono,
                    usr.id_pais,
                    pais_nombre = p != null ? p.codigo_iso2 : null,
                    usr.id_idioma_preferido,
                    idioma_preferido_nombre = ip != null ? ip.nombre_largo : null,
                    usr.id_idioma_default_evento,
                    idioma_default_evento_nombre = ide != null ? ide.nombre_largo : null,
                    usr.recibir_novedades,
                    usr.fecha_alta,
                    usr.ultimo_login
                }
            ).SingleOrDefaultAsync();

            if (u == null)
                return NotFound("Usuario inexistente.");

            short? idRolOwner = await _context.Set<ef_roles>()
                .AsNoTracking()
                .Where(r => r.codigo == "EVENT_OWNER" && r.activo)
                .Select(r => (short?)r.id_rol)
                .SingleOrDefaultAsync();

            short? idRolHost = await _context.Set<ef_roles>()
                .AsNoTracking()
                .Where(r => r.codigo == "EVENT_HOST" && r.activo)
                .Select(r => (short?)r.id_rol)
                .SingleOrDefaultAsync();

            short? idRolClientAdmin = await _context.Set<ef_roles>()
                .AsNoTracking()
                .Where(r => r.codigo == "EVENT_CLIENT_ADMIN" && r.activo)
                .Select(r => (short?)r.id_rol)
                .SingleOrDefaultAsync();

            var eventosUsuario = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on eu.id_evento equals ev.id_evento
                where eu.id_usuario == idUsuario && eu.activo
                select new
                {
                    eu.id_rol,
                    ev.anfitriones_texto,
                    ev.fecha_alta
                }
            ).ToListAsync();

            var propios = idRolOwner.HasValue
                ? eventosUsuario.Count(x => x.id_rol == idRolOwner.Value)
                : 0;

            var compartidos = (idRolHost.HasValue || idRolClientAdmin.HasValue)
                ? eventosUsuario.Count(x =>
                    (idRolHost.HasValue && x.id_rol == idRolHost.Value) ||
                    (idRolClientAdmin.HasValue && x.id_rol == idRolClientAdmin.Value))
                : 0;

            var ultimoEvento = eventosUsuario
                .Where(x => !string.IsNullOrWhiteSpace(x.anfitriones_texto))
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefault();

            var dto = new MiPerfilDTO
            {
                id_usuario = u.id_usuario,
                email = u.email,
                nombre = u.nombre,
                apellido = u.apellido,
                telefono = u.telefono,
                id_pais = u.id_pais,
                pais_nombre = u.pais_nombre,
                id_idioma_preferido = u.id_idioma_preferido,
                idioma_preferido_nombre = u.idioma_preferido_nombre,
                id_idioma_default_evento = u.id_idioma_default_evento,
                idioma_default_evento_nombre = u.idioma_default_evento_nombre,
                recibir_novedades = u.recibir_novedades,
                fecha_alta = u.fecha_alta,
                ultimo_acceso = u.ultimo_login,
                cantidad_eventos_propios = propios,
                cantidad_eventos_compartidos = compartidos,
                ultimo_evento_creado = ultimoEvento != null ? ultimoEvento.anfitriones_texto : null
            };

            return Ok(dto);
        }

        [Authorize]
        [HttpPut("mi-perfil")]
        public async Task<ActionResult<MiPerfilDTO>> UpdateMiPerfil([FromBody] UsuarioPerfilUpdateDTO req)
        {
            long idUsuario = User.GetUserId();

            var usuario = await _context.Set<ef_usuarios>()
                .FirstOrDefaultAsync(u => u.id_usuario == idUsuario);

            if (usuario == null)
                return NotFound("Usuario inexistente.");

            // Validar que el email (o campos obligatorios) sigan siendo válidos si se cambiaran, 
            // pero en este DTO solo permitimos campos de perfil.

            usuario.nombre = req.nombre;
            usuario.apellido = req.apellido;
            usuario.telefono = req.telefono;
            
            if (req.recibir_novedades.HasValue)
                usuario.recibir_novedades = req.recibir_novedades.Value;

            if (!string.IsNullOrWhiteSpace(req.pais_codigo))
            {
                var p = await _context.Set<ef_paises>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.codigo_iso2 == req.pais_codigo);
                if (p != null)
                    usuario.id_pais = p.id_pais;
            }

            if (!string.IsNullOrWhiteSpace(req.idioma_codigo))
            {
                var idio = await _context.Set<ef_idiomas>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.codigo_idioma == req.idioma_codigo || x.locale == req.idioma_codigo);
                if (idio != null)
                    usuario.id_idioma_preferido = idio.id_idioma;
            }

            if (!string.IsNullOrWhiteSpace(req.avatar_url))
            {
                usuario.avatar_url = req.avatar_url;
            }

            usuario.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            // Retornamos el perfil actualizado (llamando al mismo DTO de respuesta que el GET)
            return await MiPerfil();
        }

    }
}
