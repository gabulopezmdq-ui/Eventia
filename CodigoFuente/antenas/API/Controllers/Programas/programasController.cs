using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("[controller]")]
    public class programasController : ControllerBase
    {
        private readonly DataContext _context;

        public programasController(DataContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("{idEvento:long}/generar-link-publico")]
        public async Task<ActionResult<ProgramaLinkPublicoResponse>> GenerarLinkPublico(long idEvento)
        {
            long idUsuario = User.GetUserId();

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_usuario == idUsuario &&
                    x.activo == true);

            if (!pertenece)
                return Forbid();

            // 1) Buscar o crear acceso default
            var acceso = await _context.Set<ef_evento_accesos>()
                .FirstOrDefaultAsync(x =>
                    x.id_evento == idEvento &&
                    x.nombre == "Inscripción general");

            if (acceso == null)
            {
                acceso = new ef_evento_accesos
                {
                    id_evento = idEvento,
                    nombre = "Inscripción general",
                    mensaje_rsvp = "Completá la inscripción al programa.",
                    es_publico = true,
                    cupo = null,
                    precio = null,
                    activo = true,
                    orden = 1,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_evento_accesos>().Add(acceso);
                await _context.SaveChangesAsync();
            }

            // 2) Setear acceso default del programa si todavía no está
            if (ev.id_acceso_default == null)
            {
                ev.id_acceso_default = acceso.id_acceso;
                ev.fecha_modif = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }

            // 3) Buscar link activo existente
            var link = await _context.Set<ef_evento_acceso_links>()
                .FirstOrDefaultAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_acceso == acceso.id_acceso &&
                    x.activo == true);

            if (link == null)
            {
                link = new ef_evento_acceso_links
                {
                    id_evento = idEvento,
                    id_acceso = acceso.id_acceso,
                    titulo = "Inscripción al programa",
                    leyenda_publica = "Formulario público de inscripción.",
                    token = await GenerarTokenUnicoAsync(),
                    max_personas_total = 9999,
                    max_adultos = null,
                    requiere_nombres_acompanantes = false,
                    activo = true,
                    fecha_expiracion = null,
                    id_usuario_creador = idUsuario,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_evento_acceso_links>().Add(link);
                await _context.SaveChangesAsync();
            }

            string urlPublica = $"/programas/inscripcion/{link.token}";

            return Ok(new ProgramaLinkPublicoResponse
            {
                Ok = true,
                IdEvento = idEvento,
                IdAcceso = acceso.id_acceso,
                IdAccesoLink = link.id_acceso_link,
                Token = link.token,
                UrlPublica = urlPublica
            });
        }

        private async Task<string> GenerarTokenUnicoAsync()
        {
            while (true)
            {
                string token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();

                bool existe = await _context.Set<ef_evento_acceso_links>()
                    .AnyAsync(x => x.token == token);

                if (!existe)
                    return token;
            }
        }


        [AllowAnonymous]
        [HttpGet("inscripcion/{token}")]
        public async Task<ActionResult<ProgramaLandingPublicaDTO>> LandingPublica(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token obligatorio.");

            var data = await (
                from link in _context.Set<ef_evento_acceso_links>().AsNoTracking()
                join acceso in _context.Set<ef_evento_accesos>().AsNoTracking()
                    on link.id_acceso equals acceso.id_acceso
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on acceso.id_evento equals ev.id_evento
                where link.token == token
                      && link.activo == true
                      && acceso.activo == true
                      && ev.tipo_operacion == "PROGRAMA"
                select new
                {
                    link,
                    acceso,
                    ev
                }
            ).SingleOrDefaultAsync();

            if (data == null)
                return NotFound("Link inexistente o inactivo.");

            bool expirado =
                data.link.fecha_expiracion.HasValue &&
                data.link.fecha_expiracion.Value < DateTimeOffset.UtcNow;

            return Ok(new ProgramaLandingPublicaDTO
            {
                IdEvento = data.ev.id_evento,
                IdAcceso = data.acceso.id_acceso,
                IdAccesoLink = data.link.id_acceso_link,
                Titulo = data.link.titulo,
                LeyendaPublica = data.link.leyenda_publica,
                AnfitrionesTexto = data.ev.anfitriones_texto,
                Saludo = data.ev.saludo,
                MensajeBienvenida = data.ev.mensaje_bienvenida,
                FechaInicio = data.ev.fecha_inicio,
                FechaFin = data.ev.fecha_fin,
                IdIdioma = data.ev.id_idioma,
                Expirado = expirado
            });
        }

        [Authorize]
        [HttpGet("mis-programas")]
        public async Task<IActionResult> MisProgramas()
        {
            long idUsuario = User.GetUserId();

            var result = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on eu.id_evento equals ev.id_evento
                join te in _context.Set<ef_tipos_evento>().AsNoTracking()
                    on ev.id_tipo_evento equals te.id_tipo_evento
                where eu.id_usuario == idUsuario
                      && eu.activo == true
                      && ev.tipo_operacion == "PROGRAMA"
                orderby ev.fecha_alta descending
                select new
                {
                    id_evento = ev.id_evento,
                    id_tipo_evento = ev.id_tipo_evento,
                    tipo_evento_codigo = te.codigo,
                    id_cuenta = ev.id_cuenta,
                    id_unidad = ev.id_unidad,
                    anfitriones_texto = ev.anfitriones_texto,
                    saludo = ev.saludo,
                    mensaje_bienvenida = ev.mensaje_bienvenida,
                    estado = ev.estado,
                    fecha_inicio = ev.fecha_inicio,
                    fecha_fin = ev.fecha_fin,
                    fecha_alta = ev.fecha_alta
                }
            ).ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idEvento:long}/periodos")]
        public async Task<ActionResult<List<ProgramaPeriodoDTO>>> GetPeriodos(long idEvento, [FromQuery] bool soloActivos = true)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            var q = _context.Set<ef_programa_periodos>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento);

            if (soloActivos)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderBy(x => x.orden)
                .ThenBy(x => x.fecha_desde)
                .Select(x => new ProgramaPeriodoDTO
                {
                    IdProgramaPeriodo = x.id_programa_periodo,
                    IdEvento = x.id_evento,
                    Codigo = x.codigo,
                    Nombre = x.nombre,
                    FechaDesde = x.fecha_desde,
                    FechaHasta = x.fecha_hasta,
                    PrecioBase = x.precio_base,
                    Moneda = x.moneda,
                    Cupo = x.cupo,
                    Orden = x.orden,
                    Activo = x.activo
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{idEvento:long}/periodos/upsert")]
        public async Task<ActionResult<ProgramaPeriodoDTO>> UpsertPeriodo(long idEvento, [FromBody] ProgramaPeriodoDTO req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            if (string.IsNullOrWhiteSpace(req.Codigo))
                return BadRequest("Código obligatorio.");

            if (string.IsNullOrWhiteSpace(req.Nombre))
                return BadRequest("Nombre obligatorio.");

            if (req.FechaHasta < req.FechaDesde)
                return BadRequest("La fecha hasta no puede ser menor a la fecha desde.");

            if (req.PrecioBase < 0)
                return BadRequest("El precio base no puede ser negativo.");

            if (req.Cupo.HasValue && req.Cupo.Value < 0)
                return BadRequest("El cupo no puede ser negativo.");

            var moneda = string.IsNullOrWhiteSpace(req.Moneda)
                ? "EUR"
                : req.Moneda.Trim().ToUpperInvariant();

            if (moneda != "EUR" && moneda != "ARS" && moneda != "USD")
                return BadRequest("Moneda inválida.");

            var codigo = req.Codigo.Trim().ToUpperInvariant();
            var now = DateTimeOffset.UtcNow;

            ef_programa_periodos? item;

            if (req.IdProgramaPeriodo.HasValue && req.IdProgramaPeriodo.Value > 0)
            {
                item = await _context.Set<ef_programa_periodos>()
                    .SingleOrDefaultAsync(x =>
                        x.id_programa_periodo == req.IdProgramaPeriodo.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Período inexistente.");
            }
            else
            {
                bool existeCodigo = await _context.Set<ef_programa_periodos>()
                    .AnyAsync(x => x.id_evento == idEvento && x.codigo == codigo);

                if (existeCodigo)
                    return BadRequest("Ya existe un período con ese código para este programa.");

                item = new ef_programa_periodos
                {
                    id_evento = idEvento,
                    fecha_alta = now
                };

                _context.Set<ef_programa_periodos>().Add(item);
            }

            item.codigo = codigo;
            item.nombre = req.Nombre.Trim();
            item.fecha_desde = req.FechaDesde;
            item.fecha_hasta = req.FechaHasta;
            item.precio_base = req.PrecioBase;
            item.moneda = moneda;
            item.cupo = req.Cupo;
            item.orden = req.Orden <= 0 ? 1 : req.Orden;
            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdProgramaPeriodo = item.id_programa_periodo;
            req.IdEvento = item.id_evento;
            req.Codigo = item.codigo;
            req.Nombre = item.nombre;
            req.Moneda = item.moneda;
            req.Orden = item.orden;
            req.Activo = item.activo;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("periodos/{idProgramaPeriodo:long}/set-activo")]
        public async Task<IActionResult> SetActivoPeriodo(long idProgramaPeriodo, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_periodos>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x => x.id_programa_periodo == idProgramaPeriodo);

            if (item == null)
                return NotFound("Período inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("El período no pertenece a un programa válido.");

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == item.id_evento &&
                    x.id_usuario == idUsuario &&
                    x.activo == true);

            if (!pertenece)
                return Forbid();

            item.activo = activo;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_programa_periodo = idProgramaPeriodo,
                activo
            });
        }

        [Authorize]
        [HttpGet("{idEvento:long}/servicios")]
        public async Task<ActionResult<List<ProgramaServicioDTO>>> GetServicios(long idEvento, [FromQuery] bool soloActivos = true)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            var q = _context.Set<ef_programa_servicios>()
                .AsNoTracking()
                .Include(x => x.servicio_base)
                .Where(x => x.id_evento == idEvento);

            if (soloActivos)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderBy(x => x.orden)
                .ThenBy(x => x.nombre)
                .Select(x => new ProgramaServicioDTO
                {
                    IdProgramaServicio = x.id_programa_servicio,
                    IdEvento = x.id_evento,
                    Codigo = x.codigo,
                    Nombre = x.nombre,
                    Descripcion = x.descripcion,
                    TipoCalculo = x.tipo_calculo,
                    Precio = x.precio,
                    Moneda = x.moneda,
                    Obligatorio = x.obligatorio,
                    PermiteCantidad = x.permite_cantidad,
                    Cupo = x.cupo,
                    Orden = x.orden,
                    RequiereSeleccionDias = x.requiere_seleccion_dias,
                    IdServicioBase = x.id_servicio_base,
                    ServicioBaseCodigo = x.servicio_base != null ? x.servicio_base.codigo : null,
                    ConfigJson = x.config_json,
                    Activo = x.activo
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{idEvento:long}/servicios/upsert")]
        public async Task<ActionResult<ProgramaServicioDTO>> UpsertServicio(long idEvento, [FromBody] ProgramaServicioDTO req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            if (!req.IdServicioBase.HasValue || req.IdServicioBase.Value <= 0)
                return BadRequest("Debe seleccionar un servicio base.");

            var servicioBase = await _context.Set<ef_param_programa_servicios_base>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x =>
                    x.id_servicio_base == req.IdServicioBase.Value &&
                    x.activo == true);

            if (servicioBase == null)
                return BadRequest("El servicio base indicado no existe o está inactivo.");

            if (string.IsNullOrWhiteSpace(req.Nombre))
                return BadRequest("Nombre obligatorio.");

            if (string.IsNullOrWhiteSpace(req.TipoCalculo))
                return BadRequest("Tipo de cálculo obligatorio.");

            var tipoCalculo = req.TipoCalculo.Trim().ToUpperInvariant();

            if (tipoCalculo != "POR_INSCRIPCION" &&
                tipoCalculo != "POR_PERIODO" &&
                tipoCalculo != "POR_DIA" &&
                tipoCalculo != "POR_CANTIDAD")
                return BadRequest("Tipo de cálculo inválido.");

            if (req.Precio < 0)
                return BadRequest("El precio no puede ser negativo.");

            if (req.Cupo.HasValue && req.Cupo.Value < 0)
                return BadRequest("El cupo no puede ser negativo.");

            var moneda = string.IsNullOrWhiteSpace(req.Moneda)
                ? "EUR"
                : req.Moneda.Trim().ToUpperInvariant();

            if (moneda != "EUR" && moneda != "ARS" && moneda != "USD")
                return BadRequest("Moneda inválida.");

            if (!string.IsNullOrWhiteSpace(req.ConfigJson))
            {
                try
                {
                    System.Text.Json.JsonDocument.Parse(req.ConfigJson);
                }
                catch
                {
                    return BadRequest("config_json no tiene un formato JSON válido.");
                }
            }

            var now = DateTimeOffset.UtcNow;

            ef_programa_servicios? item;

            if (req.IdProgramaServicio.HasValue && req.IdProgramaServicio.Value > 0)
            {
                item = await _context.Set<ef_programa_servicios>()
                    .SingleOrDefaultAsync(x =>
                        x.id_programa_servicio == req.IdProgramaServicio.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Servicio inexistente.");

                bool existeOtroMismoServicioBase = await _context.Set<ef_programa_servicios>()
                    .AnyAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_servicio_base == req.IdServicioBase.Value &&
                        x.id_programa_servicio != req.IdProgramaServicio.Value);

                if (existeOtroMismoServicioBase)
                    return BadRequest("Ese servicio base ya fue agregado al programa.");
            }
            else
            {
                bool existeServicioBase = await _context.Set<ef_programa_servicios>()
                    .AnyAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_servicio_base == req.IdServicioBase.Value);

                if (existeServicioBase)
                    return BadRequest("Ese servicio base ya fue agregado al programa.");

                item = new ef_programa_servicios
                {
                    id_evento = idEvento,
                    fecha_alta = now
                };

                _context.Set<ef_programa_servicios>().Add(item);
            }

            item.id_servicio_base = req.IdServicioBase.Value;
            item.codigo = servicioBase.codigo;
            item.nombre = req.Nombre.Trim();
            item.descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim();
            item.tipo_calculo = tipoCalculo;
            item.precio = req.Precio;
            item.moneda = moneda;
            item.obligatorio = req.Obligatorio;
            item.permite_cantidad = req.PermiteCantidad;
            item.requiere_seleccion_dias = req.RequiereSeleccionDias;
            item.cupo = req.Cupo;
            item.orden = req.Orden <= 0 ? 1 : req.Orden;
            item.activo = req.Activo;
            item.config_json = string.IsNullOrWhiteSpace(req.ConfigJson) ? null : req.ConfigJson.Trim();
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdProgramaServicio = item.id_programa_servicio;
            req.IdEvento = item.id_evento;
            req.IdServicioBase = item.id_servicio_base;
            req.ServicioBaseCodigo = servicioBase.codigo;
            req.Codigo = item.codigo;
            req.Nombre = item.nombre;
            req.Descripcion = item.descripcion;
            req.TipoCalculo = item.tipo_calculo;
            req.Precio = item.precio;
            req.Moneda = item.moneda;
            req.Obligatorio = item.obligatorio;
            req.PermiteCantidad = item.permite_cantidad;
            req.RequiereSeleccionDias = item.requiere_seleccion_dias;
            req.Cupo = item.cupo;
            req.Orden = item.orden;
            req.Activo = item.activo;
            req.ConfigJson = item.config_json;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("servicios/{idProgramaServicio:long}/set-activo")]
        public async Task<IActionResult> SetActivoServicio(long idProgramaServicio, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_servicios>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x => x.id_programa_servicio == idProgramaServicio);

            if (item == null)
                return NotFound("Servicio inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("El servicio no pertenece a un programa válido.");

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == item.id_evento &&
                    x.id_usuario == idUsuario &&
                    x.activo == true);

            if (!pertenece)
                return Forbid();

            item.activo = activo;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_programa_servicio = idProgramaServicio,
                activo
            });
        }

        [AllowAnonymous]
        [HttpGet("tipos-calculo")]
        public async Task<IActionResult> GetTiposCalculo([FromQuery] short idIdioma)
        {
            var result = await (
                from tc in _context.Set<ef_param_programa_tipos_calculo>().AsNoTracking()
                where tc.activo == true
                orderby tc.orden
                select new
                {
                    id = tc.id_tipo_calculo,
                    codigo = tc.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "PROGRAMA_TIPO_CALCULO" &&
                            tr.id_item == tc.id_tipo_calculo &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? tc.codigo,
                    orden = tc.orden
                }
            ).ToListAsync();

            return Ok(result);
        }


        [AllowAnonymous]
        [HttpGet("servicios-base")]
        public async Task<IActionResult> GetServiciosBase([FromQuery] short idIdioma)
        {
            var result = await (
                from sb in _context.Set<ef_param_programa_servicios_base>().AsNoTracking()
                where sb.activo == true
                orderby sb.orden
                select new ProgramaServicioBaseDTO
                {
                    IdServicioBase = sb.id_servicio_base,
                    Codigo = sb.codigo,
                    Nombre = _context.Set<ef_param_programa_servicio_base_traducciones>()
                        .Where(tr =>
                            tr.id_servicio_base == sb.id_servicio_base &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.nombre)
                        .FirstOrDefault() ?? sb.codigo,
                    Descripcion = _context.Set<ef_param_programa_servicio_base_traducciones>()
                        .Where(tr =>
                            tr.id_servicio_base == sb.id_servicio_base &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.descripcion)
                        .FirstOrDefault(),
                    Orden = sb.orden
                }
            ).ToListAsync();

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("tipos-campo-extra")]
        public async Task<IActionResult> GetTiposCampoExtra([FromQuery] short idIdioma)
        {
            var result = await (
                from t in _context.Set<ef_param_programa_tipos_campo_extra>().AsNoTracking()
                where t.activo == true
                orderby t.orden
                select new
                {
                    id = t.id_tipo_campo_extra,
                    codigo = t.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "PROGRAMA_TIPO_CAMPO_EXTRA" &&
                            tr.id_item == t.id_tipo_campo_extra &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? t.codigo,
                    orden = t.orden
                }
            ).ToListAsync();

            return Ok(result);
        }



    }
}