using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using API.Services.Eventos;
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
        private readonly IProgramasService _programasService;

        public programasController(DataContext context, IProgramasService programasService)
        {
            _context = context;
            _programasService = programasService;
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
        public async Task<ActionResult<ProgramaLandingPublicaDTO>> LandingPublica(string token, [FromQuery] short? idIdioma)
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

            short idiomaActual = idIdioma ?? data.ev.id_idioma;

            var idiomas = await _context.Set<ef_idiomas>()
                .AsNoTracking()
                .Where(x => x.activo == true)
                .OrderBy(x => x.id_idioma)
                .Select(x => new ProgramaLandingIdiomaDTO
                {
                    IdIdioma = x.id_idioma,
                    Locale = x.locale,
                    NombreLargo = x.nombre_largo,
                    BanderaIso2 = x.bandera_iso2
                })
                .ToListAsync();

            var periodos = await _context.Set<ef_programa_periodos>()
                .AsNoTracking()
                .Where(x => x.id_evento == data.ev.id_evento && x.activo == true)
                .OrderBy(x => x.orden)
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

            var servicios = await _context.Set<ef_programa_servicios>()
                .AsNoTracking()
                .Include(x => x.servicio_base)
                .Where(x => x.id_evento == data.ev.id_evento && x.activo == true)
                .OrderBy(x => x.orden)
                .Select(x => new ProgramaServicioDTO
                {
                    IdProgramaServicio = x.id_programa_servicio,
                    IdEvento = x.id_evento,
                    IdServicioBase = x.id_servicio_base,
                    ServicioBaseCodigo = x.servicio_base != null ? x.servicio_base.codigo : null,
                    Codigo = x.codigo,
                    Nombre = x.nombre,
                    Descripcion = x.descripcion,
                    TipoCalculo = x.tipo_calculo,
                    Precio = x.precio,
                    Moneda = x.moneda,
                    Obligatorio = x.obligatorio,
                    PermiteCantidad = x.permite_cantidad,
                    RequiereSeleccionDias = x.requiere_seleccion_dias,
                    Cupo = x.cupo,
                    Orden = x.orden,
                    Activo = x.activo,
                    ConfigJson = x.config_json
                })
                .ToListAsync();

            var salud = await _context.Set<ef_programa_salud_config>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == data.ev.id_evento && x.activo == true);

            var saludConfig = salud == null
                ? new ProgramaSaludConfigDTO
                {
                    IdEvento = data.ev.id_evento,
                    PedirProblemaMedico = true,
                    PedirAlergiasNoAlimentarias = true,
                    PedirNecesidadEspecial = true,
                    PedirCoberturaMedica = false,
                    PedirContactoEmergencia = true,
                    ContactoEmergenciaObligatorio = true,
                    PedirAutorizaEmergenciaMedica = true,
                    AutorizaEmergenciaMedicaObligatorio = true,
                    PedirObservacionesFamilia = true,
                    PedirMedicaciones = true,
                    Activo = true
                }
                : new ProgramaSaludConfigDTO
                {
                    IdSaludConfig = salud.id_salud_config,
                    IdEvento = salud.id_evento,
                    PedirProblemaMedico = salud.pedir_problema_medico,
                    ProblemaMedicoObligatorio = salud.problema_medico_obligatorio,
                    PedirAlergiasNoAlimentarias = salud.pedir_alergias_no_alimentarias,
                    AlergiasNoAlimentariasObligatorio = salud.alergias_no_alimentarias_obligatorio,
                    PedirNecesidadEspecial = salud.pedir_necesidad_especial,
                    NecesidadEspecialObligatorio = salud.necesidad_especial_obligatorio,
                    PedirCoberturaMedica = salud.pedir_cobertura_medica,
                    CoberturaMedicaObligatorio = salud.cobertura_medica_obligatorio,
                    PedirContactoEmergencia = salud.pedir_contacto_emergencia,
                    ContactoEmergenciaObligatorio = salud.contacto_emergencia_obligatorio,
                    PedirAutorizaEmergenciaMedica = salud.pedir_autoriza_emergencia_medica,
                    AutorizaEmergenciaMedicaObligatorio = salud.autoriza_emergencia_medica_obligatorio,
                    PedirObservacionesFamilia = salud.pedir_observaciones_familia,
                    ObservacionesFamiliaObligatorio = salud.observaciones_familia_obligatorio,
                    PedirMedicaciones = salud.pedir_medicaciones,
                    MedicacionesObligatorio = salud.medicaciones_obligatorio,
                    Activo = salud.activo
                };

            var autorizaciones = await _context.Set<ef_programa_autorizaciones_config>()
                .AsNoTracking()
                .Where(x => x.id_evento == data.ev.id_evento && x.activo == true)
                .OrderBy(x => x.orden)
                .Select(x => new ProgramaAutorizacionConfigDTO
                {
                    IdProgramaAutorizacionConfig = x.id_programa_autorizacion_config,
                    IdEvento = x.id_evento,
                    IdAutorizacionBase = x.id_autorizacion_base,
                    Codigo = x.codigo,
                    Obligatoria = x.obligatoria,
                    RequiereAceptacion = x.requiere_aceptacion,
                    RequiereDatosResponsable = x.requiere_datos_responsable,
                    Orden = x.orden,
                    Activo = x.activo,
                    Titulo =
                        _context.Set<ef_programa_autorizacion_config_traducciones>()
                            .Where(tr => tr.id_programa_autorizacion_config == x.id_programa_autorizacion_config
                                      && tr.id_idioma == idiomaActual
                                      && tr.activo == true)
                            .Select(tr => tr.titulo)
                            .FirstOrDefault()
                        ?? _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                            .Where(tr => x.id_autorizacion_base != null
                                      && tr.id_autorizacion_base == x.id_autorizacion_base.Value
                                      && tr.id_idioma == idiomaActual
                                      && tr.activo == true)
                            .Select(tr => tr.titulo)
                            .FirstOrDefault()
                        ?? x.codigo,
                    Texto =
                        _context.Set<ef_programa_autorizacion_config_traducciones>()
                            .Where(tr => tr.id_programa_autorizacion_config == x.id_programa_autorizacion_config
                                      && tr.id_idioma == idiomaActual
                                      && tr.activo == true)
                            .Select(tr => tr.texto)
                            .FirstOrDefault()
                        ?? _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                            .Where(tr => x.id_autorizacion_base != null
                                      && tr.id_autorizacion_base == x.id_autorizacion_base.Value
                                      && tr.id_idioma == idiomaActual
                                      && tr.activo == true)
                            .Select(tr => tr.texto)
                            .FirstOrDefault()
                })
                .ToListAsync();


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
                IdIdiomaActual = idiomaActual,
                Expirado = expirado,

                Idiomas = idiomas,
                Periodos = periodos,
                Servicios = servicios,
                SaludConfig = saludConfig,
                Autorizaciones = autorizaciones
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

        [AllowAnonymous]
        [HttpGet("autorizaciones-base")]
        public async Task<ActionResult<List<ProgramaAutorizacionBaseDTO>>> GetAutorizacionesBase([FromQuery] short idIdioma)
        {
            var result = await (
                from ab in _context.Set<ef_param_programa_autorizaciones_base>().AsNoTracking()
                where ab.activo == true
                orderby ab.orden
                select new ProgramaAutorizacionBaseDTO
                {
                    IdAutorizacionBase = ab.id_autorizacion_base,
                    Codigo = ab.codigo,
                    Titulo = _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                        .Where(tr =>
                            tr.id_autorizacion_base == ab.id_autorizacion_base &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.titulo)
                        .FirstOrDefault() ?? ab.codigo,
                    Texto = _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                        .Where(tr =>
                            tr.id_autorizacion_base == ab.id_autorizacion_base &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault(),
                    Orden = ab.orden
                }
            ).ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idEvento:long}/autorizaciones-config")]
        public async Task<ActionResult<List<ProgramaAutorizacionConfigDTO>>> GetAutorizacionesConfig(
    long idEvento,
    [FromQuery] short idIdioma,
    [FromQuery] bool soloActivas = true)
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

            var q = _context.Set<ef_programa_autorizaciones_config>()
                .AsNoTracking()
                .Include(x => x.autorizacion_base)
                .Where(x => x.id_evento == idEvento);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderBy(x => x.orden)
                .Select(x => new ProgramaAutorizacionConfigDTO
                {
                    IdProgramaAutorizacionConfig = x.id_programa_autorizacion_config,
                    IdEvento = x.id_evento,
                    IdAutorizacionBase = x.id_autorizacion_base,
                    Codigo = x.codigo,
                    TituloOverride = x.titulo_override,
                    TextoOverride = x.texto_override,
                    Titulo = !string.IsNullOrWhiteSpace(x.titulo_override)
                        ? x.titulo_override
                        : _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                            .Where(tr =>
                                tr.id_autorizacion_base == x.id_autorizacion_base &&
                                tr.id_idioma == idIdioma &&
                                tr.activo == true)
                            .Select(tr => tr.titulo)
                            .FirstOrDefault() ?? x.codigo,
                    Texto = !string.IsNullOrWhiteSpace(x.texto_override)
                        ? x.texto_override
                        : _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                            .Where(tr =>
                                tr.id_autorizacion_base == x.id_autorizacion_base &&
                                tr.id_idioma == idIdioma &&
                                tr.activo == true)
                            .Select(tr => tr.texto)
                            .FirstOrDefault(),
                    Obligatoria = x.obligatoria,
                    RequiereAceptacion = x.requiere_aceptacion,
                    RequiereDatosResponsable = x.requiere_datos_responsable,
                    Orden = x.orden,
                    Activo = x.activo
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{idEvento:long}/autorizaciones-config/upsert")]
        public async Task<ActionResult<ProgramaAutorizacionConfigDTO>> UpsertAutorizacionConfig(long idEvento, [FromBody] ProgramaAutorizacionConfigDTO req)
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

            ef_param_programa_autorizaciones_base? autBase = null;

            if (req.IdAutorizacionBase.HasValue && req.IdAutorizacionBase.Value > 0)
            {
                autBase = await _context.Set<ef_param_programa_autorizaciones_base>()
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x =>
                        x.id_autorizacion_base == req.IdAutorizacionBase.Value &&
                        x.activo == true);

                if (autBase == null)
                    return BadRequest("La autorización base indicada no existe o está inactiva.");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(req.Codigo))
                    return BadRequest("Debe indicar un código para la autorización personalizada.");
            }

            var now = DateTimeOffset.UtcNow;

            ef_programa_autorizaciones_config? item;

            if (req.IdProgramaAutorizacionConfig.HasValue && req.IdProgramaAutorizacionConfig.Value > 0)
            {
                item = await _context.Set<ef_programa_autorizaciones_config>()
                    .SingleOrDefaultAsync(x =>
                        x.id_programa_autorizacion_config == req.IdProgramaAutorizacionConfig.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Autorización configurada inexistente.");

                bool existeOtra = await _context.Set<ef_programa_autorizaciones_config>()
                    .AnyAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_autorizacion_base == req.IdAutorizacionBase &&
                        x.id_programa_autorizacion_config != req.IdProgramaAutorizacionConfig.Value);

                if (existeOtra)
                    return BadRequest("Esa autorización base ya fue agregada al programa.");
            }
            else
            {
                bool existe = await _context.Set<ef_programa_autorizaciones_config>()
                    .AnyAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_autorizacion_base == req.IdAutorizacionBase);

                if (existe)
                    return BadRequest("Esa autorización base ya fue agregada al programa.");

                item = new ef_programa_autorizaciones_config
                {
                    id_evento = idEvento,
                    fecha_alta = now
                };

                _context.Set<ef_programa_autorizaciones_config>().Add(item);
            }

            item.id_autorizacion_base = req.IdAutorizacionBase;

            item.codigo = autBase != null
                ? autBase.codigo
                : req.Codigo.Trim().ToUpperInvariant();

            item.titulo_override = string.IsNullOrWhiteSpace(req.TituloOverride) ? null : req.TituloOverride.Trim();
            item.texto_override = string.IsNullOrWhiteSpace(req.TextoOverride) ? null : req.TextoOverride.Trim();
            item.obligatoria = req.Obligatoria;
            item.requiere_aceptacion = req.RequiereAceptacion;
            item.requiere_datos_responsable = req.RequiereDatosResponsable;
            item.orden = req.Orden <= 0 ? 1 : req.Orden;
            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdProgramaAutorizacionConfig = item.id_programa_autorizacion_config;
            req.IdEvento = item.id_evento;
            req.IdAutorizacionBase = item.id_autorizacion_base;
            req.Codigo = item.codigo;
            req.TituloOverride = item.titulo_override;
            req.TextoOverride = item.texto_override;
            req.Obligatoria = item.obligatoria;
            req.RequiereAceptacion = item.requiere_aceptacion;
            req.RequiereDatosResponsable = item.requiere_datos_responsable;
            req.Orden = item.orden;
            req.Activo = item.activo;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("autorizaciones-config/{idProgramaAutorizacionConfig:long}/set-activo")]
        public async Task<IActionResult> SetActivoAutorizacionConfig(long idProgramaAutorizacionConfig, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_autorizaciones_config>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x =>
                    x.id_programa_autorizacion_config == idProgramaAutorizacionConfig);

            if (item == null)
                return NotFound("Autorización configurada inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("La autorización no pertenece a un programa válido.");

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
                id_programa_autorizacion_config = idProgramaAutorizacionConfig,
                activo
            });
        }


        [AllowAnonymous]
        [HttpGet("salud/tipos-accion")]
        public async Task<IActionResult> GetSaludTiposAccion([FromQuery] short idIdioma)
        {
            var result = await (
                from t in _context.Set<ef_param_programa_salud_tipos_accion>().AsNoTracking()
                where t.activo == true
                orderby t.orden
                select new
                {
                    id = t.id_tipo_accion_salud,
                    codigo = t.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "PROGRAMA_SALUD_TIPO_ACCION" &&
                            tr.id_item == t.id_tipo_accion_salud &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? t.codigo,
                    orden = t.orden
                }
            ).ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idEvento:long}/salud/medicaciones")]
        public async Task<ActionResult<List<ProgramaSaludMedicacionDTO>>> GetSaludMedicaciones(
    long idEvento,
    [FromQuery] bool soloActivas = true)
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

            var q = _context.Set<ef_programa_salud_medicaciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderBy(x => x.id_inscripcion)
                .ThenBy(x => x.nombre_medicamento)
                .Select(x => new ProgramaSaludMedicacionDTO
                {
                    IdMedicacion = x.id_medicacion,
                    IdEvento = x.id_evento,
                    IdInscripcion = x.id_inscripcion,
                    NombreMedicamento = x.nombre_medicamento,
                    Dosis = x.dosis,
                    Frecuencia = x.frecuencia,
                    Horario = x.horario,
                    Instrucciones = x.instrucciones,
                    AdministracionAutorizada = x.administracion_autorizada,
                    DebeLlevarParticipante = x.debe_llevar_participante,
                    RequiereRefrigeracion = x.requiere_refrigeracion,
                    Activo = x.activo,
                    FechaAlta = x.fecha_alta
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{idEvento:long}/salud/medicaciones/upsert")]
        public async Task<ActionResult<ProgramaSaludMedicacionDTO>> UpsertSaludMedicacion(
    long idEvento,
    [FromBody] ProgramaSaludMedicacionDTO req)
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

            if (req.IdInscripcion <= 0)
                return BadRequest("Debe indicar la inscripción.");

            if (string.IsNullOrWhiteSpace(req.NombreMedicamento))
                return BadRequest("Debe indicar el nombre del medicamento.");

            var now = DateTimeOffset.UtcNow;

            ef_programa_salud_medicaciones? item;

            if (req.IdMedicacion.HasValue && req.IdMedicacion.Value > 0)
            {
                item = await _context.Set<ef_programa_salud_medicaciones>()
                    .SingleOrDefaultAsync(x =>
                        x.id_medicacion == req.IdMedicacion.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Medicación inexistente.");
            }
            else
            {
                item = new ef_programa_salud_medicaciones
                {
                    id_evento = idEvento,
                    id_inscripcion = req.IdInscripcion,
                    fecha_alta = now
                };

                _context.Set<ef_programa_salud_medicaciones>().Add(item);
            }

            item.id_inscripcion = req.IdInscripcion;
            item.nombre_medicamento = req.NombreMedicamento.Trim();
            item.dosis = string.IsNullOrWhiteSpace(req.Dosis) ? null : req.Dosis.Trim();
            item.frecuencia = string.IsNullOrWhiteSpace(req.Frecuencia) ? null : req.Frecuencia.Trim();
            item.horario = string.IsNullOrWhiteSpace(req.Horario) ? null : req.Horario.Trim();
            item.instrucciones = string.IsNullOrWhiteSpace(req.Instrucciones) ? null : req.Instrucciones.Trim();

            item.administracion_autorizada = req.AdministracionAutorizada;
            item.debe_llevar_participante = req.DebeLlevarParticipante;
            item.requiere_refrigeracion = req.RequiereRefrigeracion;
            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdMedicacion = item.id_medicacion;
            req.IdEvento = item.id_evento;
            req.IdInscripcion = item.id_inscripcion;
            req.NombreMedicamento = item.nombre_medicamento;
            req.Dosis = item.dosis;
            req.Frecuencia = item.frecuencia;
            req.Horario = item.horario;
            req.Instrucciones = item.instrucciones;
            req.AdministracionAutorizada = item.administracion_autorizada;
            req.DebeLlevarParticipante = item.debe_llevar_participante;
            req.RequiereRefrigeracion = item.requiere_refrigeracion;
            req.Activo = item.activo;
            req.FechaAlta = item.fecha_alta;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("salud/medicaciones/{idMedicacion:long}/set-activo")]
        public async Task<IActionResult> SetActivoSaludMedicacion(
    long idMedicacion,
    [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_salud_medicaciones>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x => x.id_medicacion == idMedicacion);

            if (item == null)
                return NotFound("Medicación inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("La medicación no pertenece a un programa válido.");

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
                id_medicacion = idMedicacion,
                activo
            });
        }

        [Authorize]
        [HttpGet("{idEvento:long}/salud/acciones")]
        public async Task<ActionResult<List<ProgramaSaludAccionDTO>>> GetSaludAcciones(
    long idEvento,
    [FromQuery] bool soloActivas = true)
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

            var q = _context.Set<ef_programa_salud_acciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderByDescending(x => x.fecha_hora)
                .Select(x => new ProgramaSaludAccionDTO
                {
                    IdAccionSalud = x.id_accion_salud,
                    IdEvento = x.id_evento,
                    IdInscripcion = x.id_inscripcion,
                    FechaHora = x.fecha_hora,
                    TipoAccion = x.tipo_accion,
                    Descripcion = x.descripcion,
                    RequirioContactoFamilia = x.requirio_contacto_familia,
                    ContactoRealizado = x.contacto_realizado,
                    RequiereSeguimiento = x.requiere_seguimiento,
                    UsuarioRegistro = x.usuario_registro,
                    Activo = x.activo
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{idEvento:long}/salud/acciones/upsert")]
        public async Task<ActionResult<ProgramaSaludAccionDTO>> UpsertSaludAccion(
    long idEvento,
    [FromBody] ProgramaSaludAccionDTO req)
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

            if (req.IdInscripcion <= 0)
                return BadRequest("Debe indicar la inscripción.");

            if (string.IsNullOrWhiteSpace(req.TipoAccion))
                return BadRequest("Debe indicar el tipo de acción.");

            if (string.IsNullOrWhiteSpace(req.Descripcion))
                return BadRequest("Debe indicar una descripción.");

            var tipoAccion = req.TipoAccion.Trim().ToUpperInvariant();

            bool tipoValido = await _context.Set<ef_param_programa_salud_tipos_accion>()
                .AnyAsync(x => x.codigo == tipoAccion && x.activo == true);

            if (!tipoValido)
                return BadRequest("El tipo de acción indicado no existe o está inactivo.");

            var now = DateTimeOffset.UtcNow;

            ef_programa_salud_acciones? item;

            if (req.IdAccionSalud.HasValue && req.IdAccionSalud.Value > 0)
            {
                item = await _context.Set<ef_programa_salud_acciones>()
                    .SingleOrDefaultAsync(x =>
                        x.id_accion_salud == req.IdAccionSalud.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Acción de salud inexistente.");
            }
            else
            {
                item = new ef_programa_salud_acciones
                {
                    id_evento = idEvento,
                    id_inscripcion = req.IdInscripcion,
                    fecha_alta = now
                };

                _context.Set<ef_programa_salud_acciones>().Add(item);
            }

            item.id_inscripcion = req.IdInscripcion;
            item.fecha_hora = req.FechaHora ?? now;
            item.tipo_accion = tipoAccion;
            item.descripcion = req.Descripcion.Trim();

            item.requirio_contacto_familia = req.RequirioContactoFamilia;
            item.contacto_realizado = req.ContactoRealizado;
            item.requiere_seguimiento = req.RequiereSeguimiento;
            item.usuario_registro = idUsuario;
            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdAccionSalud = item.id_accion_salud;
            req.IdEvento = item.id_evento;
            req.IdInscripcion = item.id_inscripcion;
            req.FechaHora = item.fecha_hora;
            req.TipoAccion = item.tipo_accion;
            req.Descripcion = item.descripcion;
            req.RequirioContactoFamilia = item.requirio_contacto_familia;
            req.ContactoRealizado = item.contacto_realizado;
            req.RequiereSeguimiento = item.requiere_seguimiento;
            req.UsuarioRegistro = item.usuario_registro;
            req.Activo = item.activo;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("salud/acciones/{idAccionSalud:long}/set-activo")]
        public async Task<IActionResult> SetActivoSaludAccion(long idAccionSalud, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_salud_acciones>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x => x.id_accion_salud == idAccionSalud);

            if (item == null)
                return NotFound("Acción de salud inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("La acción de salud no pertenece a un programa válido.");

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
                id_accion_salud = idAccionSalud,
                activo
            });
        }

        [Authorize]
        [HttpGet("{idEvento:long}/salud/fichas")]
        public async Task<ActionResult<List<ProgramaSaludFichaDTO>>> GetSaludFichas(
    long idEvento,
    [FromQuery] bool soloActivas = true)
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

            var q = _context.Set<ef_programa_salud_fichas>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            var result = await q
                .OrderBy(x => x.id_inscripcion)
                .Select(x => new ProgramaSaludFichaDTO
                {
                    IdFichaSalud = x.id_ficha_salud,
                    IdEvento = x.id_evento,
                    IdInscripcion = x.id_inscripcion,
                    TieneProblemaMedico = x.tiene_problema_medico,
                    DetalleProblemaMedico = x.detalle_problema_medico,
                    TieneAlergiasNoAlimentarias = x.tiene_alergias_no_alimentarias,
                    DetalleAlergiasNoAlimentarias = x.detalle_alergias_no_alimentarias,
                    TieneNecesidadEspecial = x.tiene_necesidad_especial,
                    DetalleNecesidadEspecial = x.detalle_necesidad_especial,
                    TieneCoberturaMedica = x.tiene_cobertura_medica,
                    CoberturaMedicaNombre = x.cobertura_medica_nombre,
                    CoberturaMedicaNumero = x.cobertura_medica_numero,
                    ContactoEmergenciaNombre = x.contacto_emergencia_nombre,
                    ContactoEmergenciaTelefono = x.contacto_emergencia_telefono,
                    ContactoEmergenciaRelacion = x.contacto_emergencia_relacion,
                    AutorizaEmergenciaMedica = x.autoriza_emergencia_medica,
                    ObservacionesFamilia = x.observaciones_familia,
                    ObservacionesInternas = x.observaciones_internas,
                    Activo = x.activo,
                    FechaAlta = x.fecha_alta
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idEvento:long}/salud/fichas/by-inscripcion/{idInscripcion:long}")]
        public async Task<ActionResult<ProgramaSaludFichaDTO>> GetSaludFichaByInscripcion(
    long idEvento,
    long idInscripcion)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var item = await _context.Set<ef_programa_salud_fichas>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento && x.id_inscripcion == idInscripcion);

            if (item == null)
                return NotFound("Ficha médica inexistente.");

            return Ok(new ProgramaSaludFichaDTO
            {
                IdFichaSalud = item.id_ficha_salud,
                IdEvento = item.id_evento,
                IdInscripcion = item.id_inscripcion,
                TieneProblemaMedico = item.tiene_problema_medico,
                DetalleProblemaMedico = item.detalle_problema_medico,
                TieneAlergiasNoAlimentarias = item.tiene_alergias_no_alimentarias,
                DetalleAlergiasNoAlimentarias = item.detalle_alergias_no_alimentarias,
                TieneNecesidadEspecial = item.tiene_necesidad_especial,
                DetalleNecesidadEspecial = item.detalle_necesidad_especial,
                TieneCoberturaMedica = item.tiene_cobertura_medica,
                CoberturaMedicaNombre = item.cobertura_medica_nombre,
                CoberturaMedicaNumero = item.cobertura_medica_numero,
                ContactoEmergenciaNombre = item.contacto_emergencia_nombre,
                ContactoEmergenciaTelefono = item.contacto_emergencia_telefono,
                ContactoEmergenciaRelacion = item.contacto_emergencia_relacion,
                AutorizaEmergenciaMedica = item.autoriza_emergencia_medica,
                ObservacionesFamilia = item.observaciones_familia,
                ObservacionesInternas = item.observaciones_internas,
                Activo = item.activo,
                FechaAlta = item.fecha_alta
            });
        }

        [Authorize]
        [HttpPost("{idEvento:long}/salud/fichas/upsert")]
        public async Task<ActionResult<ProgramaSaludFichaDTO>> UpsertSaludFicha(
    long idEvento,
    [FromBody] ProgramaSaludFichaDTO req)
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

            if (req.IdInscripcion <= 0)
                return BadRequest("Debe indicar la inscripción.");

            if (req.TieneProblemaMedico && string.IsNullOrWhiteSpace(req.DetalleProblemaMedico))
                return BadRequest("Debe detallar el problema médico.");

            if (req.TieneAlergiasNoAlimentarias && string.IsNullOrWhiteSpace(req.DetalleAlergiasNoAlimentarias))
                return BadRequest("Debe detallar las alergias no alimentarias.");

            if (req.TieneNecesidadEspecial && string.IsNullOrWhiteSpace(req.DetalleNecesidadEspecial))
                return BadRequest("Debe detallar la necesidad especial.");

            if (req.TieneCoberturaMedica && string.IsNullOrWhiteSpace(req.CoberturaMedicaNombre))
                return BadRequest("Debe indicar el nombre de la cobertura médica.");

            var now = DateTimeOffset.UtcNow;

            ef_programa_salud_fichas? item;

            if (req.IdFichaSalud.HasValue && req.IdFichaSalud.Value > 0)
            {
                item = await _context.Set<ef_programa_salud_fichas>()
                    .SingleOrDefaultAsync(x =>
                        x.id_ficha_salud == req.IdFichaSalud.Value &&
                        x.id_evento == idEvento);

                if (item == null)
                    return NotFound("Ficha médica inexistente.");
            }
            else
            {
                item = await _context.Set<ef_programa_salud_fichas>()
                    .SingleOrDefaultAsync(x =>
                        x.id_evento == idEvento &&
                        x.id_inscripcion == req.IdInscripcion);

                if (item == null)
                {
                    item = new ef_programa_salud_fichas
                    {
                        id_evento = idEvento,
                        id_inscripcion = req.IdInscripcion,
                        fecha_alta = now
                    };

                    _context.Set<ef_programa_salud_fichas>().Add(item);
                }
            }

            item.id_inscripcion = req.IdInscripcion;

            item.tiene_problema_medico = req.TieneProblemaMedico;
            item.detalle_problema_medico = string.IsNullOrWhiteSpace(req.DetalleProblemaMedico) ? null : req.DetalleProblemaMedico.Trim();

            item.tiene_alergias_no_alimentarias = req.TieneAlergiasNoAlimentarias;
            item.detalle_alergias_no_alimentarias = string.IsNullOrWhiteSpace(req.DetalleAlergiasNoAlimentarias) ? null : req.DetalleAlergiasNoAlimentarias.Trim();

            item.tiene_necesidad_especial = req.TieneNecesidadEspecial;
            item.detalle_necesidad_especial = string.IsNullOrWhiteSpace(req.DetalleNecesidadEspecial) ? null : req.DetalleNecesidadEspecial.Trim();

            item.tiene_cobertura_medica = req.TieneCoberturaMedica;
            item.cobertura_medica_nombre = string.IsNullOrWhiteSpace(req.CoberturaMedicaNombre) ? null : req.CoberturaMedicaNombre.Trim();
            item.cobertura_medica_numero = string.IsNullOrWhiteSpace(req.CoberturaMedicaNumero) ? null : req.CoberturaMedicaNumero.Trim();

            item.contacto_emergencia_nombre = string.IsNullOrWhiteSpace(req.ContactoEmergenciaNombre) ? null : req.ContactoEmergenciaNombre.Trim();
            item.contacto_emergencia_telefono = string.IsNullOrWhiteSpace(req.ContactoEmergenciaTelefono) ? null : req.ContactoEmergenciaTelefono.Trim();
            item.contacto_emergencia_relacion = string.IsNullOrWhiteSpace(req.ContactoEmergenciaRelacion) ? null : req.ContactoEmergenciaRelacion.Trim();

            item.autoriza_emergencia_medica = req.AutorizaEmergenciaMedica;

            item.observaciones_familia = string.IsNullOrWhiteSpace(req.ObservacionesFamilia) ? null : req.ObservacionesFamilia.Trim();
            item.observaciones_internas = string.IsNullOrWhiteSpace(req.ObservacionesInternas) ? null : req.ObservacionesInternas.Trim();

            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdFichaSalud = item.id_ficha_salud;
            req.IdEvento = item.id_evento;
            req.IdInscripcion = item.id_inscripcion;
            req.FechaAlta = item.fecha_alta;

            return Ok(req);
        }

        [Authorize]
        [HttpPut("salud/fichas/{idFichaSalud:long}/set-activo")]
        public async Task<IActionResult> SetActivoSaludFicha(
    long idFichaSalud,
    [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            var item = await _context.Set<ef_programa_salud_fichas>()
                .Include(x => x.evento)
                .SingleOrDefaultAsync(x => x.id_ficha_salud == idFichaSalud);

            if (item == null)
                return NotFound("Ficha médica inexistente.");

            if (item.evento == null || item.evento.tipo_operacion != "PROGRAMA")
                return BadRequest("La ficha médica no pertenece a un programa válido.");

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
                id_ficha_salud = idFichaSalud,
                activo
            });
        }

        [Authorize]
        [HttpGet("{idEvento:long}/salud/config")]
        public async Task<ActionResult<ProgramaSaludConfigDTO>> GetSaludConfig(long idEvento)
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

            var item = await _context.Set<ef_programa_salud_config>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (item == null)
            {
                return Ok(new ProgramaSaludConfigDTO
                {
                    IdEvento = idEvento,
                    PedirProblemaMedico = true,
                    ProblemaMedicoObligatorio = false,
                    PedirAlergiasNoAlimentarias = true,
                    AlergiasNoAlimentariasObligatorio = false,
                    PedirNecesidadEspecial = true,
                    NecesidadEspecialObligatorio = false,
                    PedirCoberturaMedica = false,
                    CoberturaMedicaObligatorio = false,
                    PedirContactoEmergencia = true,
                    ContactoEmergenciaObligatorio = true,
                    PedirAutorizaEmergenciaMedica = true,
                    AutorizaEmergenciaMedicaObligatorio = true,
                    PedirObservacionesFamilia = true,
                    ObservacionesFamiliaObligatorio = false,
                    PedirMedicaciones = true,
                    MedicacionesObligatorio = false,
                    Activo = true
                });
            }

            return Ok(new ProgramaSaludConfigDTO
            {
                IdSaludConfig = item.id_salud_config,
                IdEvento = item.id_evento,
                PedirProblemaMedico = item.pedir_problema_medico,
                ProblemaMedicoObligatorio = item.problema_medico_obligatorio,
                PedirAlergiasNoAlimentarias = item.pedir_alergias_no_alimentarias,
                AlergiasNoAlimentariasObligatorio = item.alergias_no_alimentarias_obligatorio,
                PedirNecesidadEspecial = item.pedir_necesidad_especial,
                NecesidadEspecialObligatorio = item.necesidad_especial_obligatorio,
                PedirCoberturaMedica = item.pedir_cobertura_medica,
                CoberturaMedicaObligatorio = item.cobertura_medica_obligatorio,
                PedirContactoEmergencia = item.pedir_contacto_emergencia,
                ContactoEmergenciaObligatorio = item.contacto_emergencia_obligatorio,
                PedirAutorizaEmergenciaMedica = item.pedir_autoriza_emergencia_medica,
                AutorizaEmergenciaMedicaObligatorio = item.autoriza_emergencia_medica_obligatorio,
                PedirObservacionesFamilia = item.pedir_observaciones_familia,
                ObservacionesFamiliaObligatorio = item.observaciones_familia_obligatorio,
                PedirMedicaciones = item.pedir_medicaciones,
                MedicacionesObligatorio = item.medicaciones_obligatorio,
                Activo = item.activo
            });
        }

        [Authorize]
        [HttpPost("{idEvento:long}/salud/config/upsert")]
        public async Task<ActionResult<ProgramaSaludConfigDTO>> UpsertSaludConfig(
    long idEvento,
    [FromBody] ProgramaSaludConfigDTO req)
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

            var now = DateTimeOffset.UtcNow;

            var item = await _context.Set<ef_programa_salud_config>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (item == null)
            {
                item = new ef_programa_salud_config
                {
                    id_evento = idEvento,
                    fecha_alta = now
                };

                _context.Set<ef_programa_salud_config>().Add(item);
            }

            item.pedir_problema_medico = req.PedirProblemaMedico;
            item.problema_medico_obligatorio = req.ProblemaMedicoObligatorio;

            item.pedir_alergias_no_alimentarias = req.PedirAlergiasNoAlimentarias;
            item.alergias_no_alimentarias_obligatorio = req.AlergiasNoAlimentariasObligatorio;

            item.pedir_necesidad_especial = req.PedirNecesidadEspecial;
            item.necesidad_especial_obligatorio = req.NecesidadEspecialObligatorio;

            item.pedir_cobertura_medica = req.PedirCoberturaMedica;
            item.cobertura_medica_obligatorio = req.CoberturaMedicaObligatorio;

            item.pedir_contacto_emergencia = req.PedirContactoEmergencia;
            item.contacto_emergencia_obligatorio = req.ContactoEmergenciaObligatorio;

            item.pedir_autoriza_emergencia_medica = req.PedirAutorizaEmergenciaMedica;
            item.autoriza_emergencia_medica_obligatorio = req.AutorizaEmergenciaMedicaObligatorio;

            item.pedir_observaciones_familia = req.PedirObservacionesFamilia;
            item.observaciones_familia_obligatorio = req.ObservacionesFamiliaObligatorio;

            item.pedir_medicaciones = req.PedirMedicaciones;
            item.medicaciones_obligatorio = req.MedicacionesObligatorio;

            item.activo = req.Activo;
            item.fecha_modif = now;

            await _context.SaveChangesAsync();

            req.IdSaludConfig = item.id_salud_config;
            req.IdEvento = item.id_evento;

            return Ok(req);
        }

        [Authorize]
        [HttpGet("autorizaciones-config/{idProgramaAutorizacionConfig:long}/traducciones")]
        public async Task<ActionResult<List<ProgramaAutorizacionConfigTraduccionDTO>>> GetAutorizacionConfigTraducciones(long idProgramaAutorizacionConfig)
        {
            var config = await _context.Set<ef_programa_autorizaciones_config>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_programa_autorizacion_config == idProgramaAutorizacionConfig);

            if (config == null)
                return NotFound("Autorización configurada inexistente.");

            var idiomas = await _context.Set<ef_idiomas>()
                .AsNoTracking()
                .Where(x => x.activo == true)
                .OrderBy(x => x.id_idioma)
                .ToListAsync();

            var traducciones = await _context.Set<ef_programa_autorizacion_config_traducciones>()
                .AsNoTracking()
                .Where(x => x.id_programa_autorizacion_config == idProgramaAutorizacionConfig)
                .ToListAsync();

            var result = idiomas.Select(i =>
            {
                var tr = traducciones.FirstOrDefault(x => x.id_idioma == i.id_idioma);

                return new ProgramaAutorizacionConfigTraduccionDTO
                {
                    IdIdioma = i.id_idioma,
                    Locale = i.locale,
                    NombreLargo = i.nombre_largo,
                    Titulo = tr?.titulo,
                    Texto = tr?.texto,
                    Activo = tr?.activo ?? true
                };
            }).ToList();

            return Ok(result);
        }

        [Authorize]
        [HttpPut("autorizaciones-config/{idProgramaAutorizacionConfig:long}/traducciones")]
        public async Task<IActionResult> UpsertAutorizacionConfigTraducciones(
    long idProgramaAutorizacionConfig,
    [FromBody] ProgramaAutorizacionConfigTraduccionesRequest req)
        {
            var config = await _context.Set<ef_programa_autorizaciones_config>()
                .SingleOrDefaultAsync(x => x.id_programa_autorizacion_config == idProgramaAutorizacionConfig);

            if (config == null)
                return NotFound("Autorización configurada inexistente.");

            var now = DateTimeOffset.UtcNow;

            foreach (var item in req.Items)
            {
                if (string.IsNullOrWhiteSpace(item.Titulo))
                    continue;

                var tr = await _context.Set<ef_programa_autorizacion_config_traducciones>()
                    .SingleOrDefaultAsync(x =>
                        x.id_programa_autorizacion_config == idProgramaAutorizacionConfig &&
                        x.id_idioma == item.IdIdioma);

                if (tr == null)
                {
                    tr = new ef_programa_autorizacion_config_traducciones
                    {
                        id_programa_autorizacion_config = idProgramaAutorizacionConfig,
                        id_idioma = item.IdIdioma,
                        fecha_alta = now
                    };

                    _context.Set<ef_programa_autorizacion_config_traducciones>().Add(tr);
                }

                tr.titulo = item.Titulo.Trim();
                tr.texto = string.IsNullOrWhiteSpace(item.Texto) ? null : item.Texto.Trim();
                tr.activo = item.Activo;
                tr.fecha_modif = now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { ok = true });
        }

        [Authorize]
        [HttpGet("{idEvento:long}/staff")]
        public async Task<ActionResult<IEnumerable<object>>> GetStaff(long idEvento)
        {
            try
            {
                var result = await _programasService.GetStaffAsync(idEvento, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize]
        [HttpPost("{idEvento:long}/staff")]
        public async Task<ActionResult<object>> AddStaff(long idEvento, [FromBody] AddProgramaStaffRequest req)
        {
            try
            {
                var result = await _programasService.AddStaffAsync(idEvento, req, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize]
        [HttpPut("{idEvento:long}/staff/{idEventoUsuario:long}")]
        public async Task<IActionResult> UpdateStaff(long idEvento, long idEventoUsuario, [FromBody] UpdateProgramaStaffRequest req)
        {
            try
            {
                await _programasService.UpdateStaffAsync(idEvento, idEventoUsuario, req, User.GetUserId());
                return Ok(new { ok = true });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize]
        [HttpDelete("{idEvento:long}/staff/{idEventoUsuario:long}")]
        public async Task<IActionResult> DeleteStaff(long idEvento, long idEventoUsuario)
        {
            try
            {
                await _programasService.DeleteStaffAsync(idEvento, idEventoUsuario, User.GetUserId());
                return Ok(new { ok = true });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize]
        [HttpPost("staff/aceptar-invitacion")]
        public async Task<IActionResult> AceptarInvitacion([FromQuery] string token)
        {
            try
            {
                var result = await _programasService.AceptarInvitacionStaffAsync(token, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [AllowAnonymous]
        [HttpPost("inscripcion/{token}/cotizar")]
        public async Task<ActionResult<ProgramaInscripcionCotizarResponse>> CotizarInscripcionPrograma(
    string token,
    [FromBody] ProgramaInscripcionCotizarRequest req)
        {
            var link = await _context.Set<ef_evento_acceso_links>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.token == token && x.activo == true);

            if (link == null)
                return NotFound("Link inexistente o inactivo.");

            long idEvento;

            if (link.id_evento != 0)
            {
                idEvento = link.id_evento;
            }
            else
            {
                var acceso = await _context.Set<ef_evento_accesos>()
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.id_acceso == link.id_acceso);

                if (acceso == null)
                    return BadRequest("El link no tiene un evento asociado.");

                idEvento = acceso.id_evento;
            }

            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                return NotFound("Programa inexistente.");

            if (ev.tipo_operacion != "PROGRAMA")
                return BadRequest("El link no corresponde a un programa.");

            if (req.Periodos == null || req.Periodos.Count == 0)
                return BadRequest("Debe seleccionar al menos un período.");

            var idsPeriodos = req.Periodos
                .Select(x => x.IdProgramaPeriodo)
                .Distinct()
                .ToList();

            var periodos = await _context.Set<ef_programa_periodos>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true &&
                    idsPeriodos.Contains(x.id_programa_periodo))
                .OrderBy(x => x.orden)
                .ToListAsync();

            if (periodos.Count != idsPeriodos.Count)
                return BadRequest("Uno o más períodos seleccionados no existen o no están activos.");

            string moneda = periodos.First().moneda;

            decimal baseTotal = periodos.Sum(x => x.precio_base);

            var serviciosResponse = new List<ProgramaInscripcionCotizarServicioResponse>();
            decimal serviciosTotal = 0;

            if (req.Servicios != null && req.Servicios.Count > 0)
            {
                var idsServicios = req.Servicios
                    .Select(x => x.IdProgramaServicio)
                    .Distinct()
                    .ToList();

                var serviciosDb = await _context.Set<ef_programa_servicios>()
                    .AsNoTracking()
                    .Where(x =>
                        x.id_evento == idEvento &&
                        x.activo == true &&
                        idsServicios.Contains(x.id_programa_servicio))
                    .ToListAsync();

                if (serviciosDb.Count != idsServicios.Count)
                    return BadRequest("Uno o más servicios seleccionados no existen o no están activos.");

                foreach (var sReq in req.Servicios)
                {
                    var servicio = serviciosDb.Single(x => x.id_programa_servicio == sReq.IdProgramaServicio);

                    if (servicio.moneda != moneda)
                        return BadRequest("Todos los períodos y servicios deben tener la misma moneda.");

                    int cantidadCalculada;

                    if (servicio.tipo_calculo == "POR_DIA")
                    {
                        if (sReq.IdProgramaPeriodo == null)
                            return BadRequest($"El servicio {servicio.nombre} requiere indicar período.");

                        var periodo = periodos.SingleOrDefault(x => x.id_programa_periodo == sReq.IdProgramaPeriodo.Value);

                        if (periodo == null)
                            return BadRequest($"El servicio {servicio.nombre} está asociado a un período no seleccionado.");

                        if (sReq.Fechas == null || sReq.Fechas.Count == 0)
                            cantidadCalculada = 0;
                        else
                        {
                            foreach (var fecha in sReq.Fechas)
                            {
                                if (fecha < periodo.fecha_desde || fecha > periodo.fecha_hasta)
                                    return BadRequest($"La fecha {fecha} no pertenece al período {periodo.nombre}.");
                            }

                            cantidadCalculada = sReq.Fechas.Distinct().Count();
                        }
                    }
                    else if (servicio.tipo_calculo == "POR_CANTIDAD")
                    {
                        cantidadCalculada = sReq.Cantidad ?? 0;

                        if (cantidadCalculada < 0)
                            return BadRequest($"La cantidad del servicio {servicio.nombre} no puede ser negativa.");
                    }
                    else if (servicio.tipo_calculo == "POR_PERIODO")
                    {
                        if (sReq.IdProgramaPeriodo.HasValue)
                            cantidadCalculada = 1;
                        else
                            cantidadCalculada = periodos.Count;
                    }
                    else if (servicio.tipo_calculo == "POR_INSCRIPCION")
                    {
                        cantidadCalculada = sReq.Cantidad ?? 1;
                    }
                    else
                    {
                        return BadRequest($"Tipo de cálculo no soportado: {servicio.tipo_calculo}");
                    }

                    decimal subtotal = servicio.precio * cantidadCalculada;

                    serviciosTotal += subtotal;

                    serviciosResponse.Add(new ProgramaInscripcionCotizarServicioResponse
                    {
                        IdProgramaServicio = servicio.id_programa_servicio,
                        Nombre = servicio.nombre,
                        TipoCalculo = servicio.tipo_calculo,
                        PrecioUnitario = servicio.precio,
                        CantidadCalculada = cantidadCalculada,
                        Subtotal = subtotal
                    });
                }
            }

            var result = new ProgramaInscripcionCotizarResponse
            {
                IdEvento = idEvento,
                Moneda = moneda,
                Base = baseTotal,
                ServiciosTotal = serviciosTotal,
                Total = baseTotal + serviciosTotal,
                Periodos = periodos.Select(x => new ProgramaInscripcionCotizarPeriodoResponse
                {
                    IdProgramaPeriodo = x.id_programa_periodo,
                    Nombre = x.nombre,
                    PrecioBase = x.precio_base
                }).ToList(),
                Servicios = serviciosResponse
            };

            return Ok(result);
        }
    }
}