using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas/inscripcion")]
    [AllowAnonymous]
    public class programasInscripcionController : ControllerBase
    {
        private readonly DataContext _context;

        public programasInscripcionController(DataContext context)
        {
            _context = context;
        }

        private static string GenerarToken(int bytes = 32)
        {
            return Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(bytes))
                .ToLowerInvariant();
        }

        private async Task<ef_audiencias_personas> UpsertAudienciaPersonaAsync(
                long idCuenta,
                string nombre,
                string apellido,
                string? email,
                string? celular,
                DateOnly? fechaNacimiento,
                bool aceptaComunicaciones,
                bool aceptaPromociones)
        {
            ef_audiencias_personas? persona = null;

            if (!string.IsNullOrWhiteSpace(email))
            {
                var emailNorm = email.Trim().ToLower();

                persona = await _context.Set<ef_audiencias_personas>()
                    .FirstOrDefaultAsync(x =>
                        x.id_cuenta == idCuenta &&
                        x.email != null &&
                        x.email.ToLower() == emailNorm);
            }

            if (persona == null && !string.IsNullOrWhiteSpace(celular))
            {
                var celularNorm = celular.Trim();

                persona = await _context.Set<ef_audiencias_personas>()
                    .FirstOrDefaultAsync(x =>
                        x.id_cuenta == idCuenta &&
                        x.celular == celularNorm);
            }

            if (persona == null)
            {
                persona = new ef_audiencias_personas
                {
                    id_cuenta = idCuenta,
                    nombre = nombre.Trim(),
                    apellido = apellido.Trim(),
                    email = string.IsNullOrWhiteSpace(email) ? null : email.Trim(),
                    celular = string.IsNullOrWhiteSpace(celular) ? null : celular.Trim(),
                    fecha_nacimiento = fechaNacimiento.HasValue
                        ? fechaNacimiento.Value.ToDateTime(TimeOnly.MinValue)
                        : null,
                    acepta_comunicaciones = aceptaComunicaciones,
                    acepta_promociones = aceptaPromociones,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_audiencias_personas>().Add(persona);
            }
            else
            {
                persona.nombre = nombre.Trim();
                persona.apellido = apellido.Trim();

                if (!string.IsNullOrWhiteSpace(email))
                    persona.email = email.Trim();

                if (!string.IsNullOrWhiteSpace(celular))
                    persona.celular = celular.Trim();

                if (fechaNacimiento.HasValue)
                    persona.fecha_nacimiento = fechaNacimiento.Value.ToDateTime(TimeOnly.MinValue);

                persona.acepta_comunicaciones = aceptaComunicaciones;
                persona.acepta_promociones = aceptaPromociones;
                persona.activo = true;
                persona.fecha_modif = DateTimeOffset.UtcNow;
            }

            return persona;
        }

        private ef_invitados CrearInvitadoPrograma(
            long idEvento,
            long idAcceso,
            long? idAccesoLink,
            long? idRsvpGrupo,
            long? idAudienciaPersona,
            string nombre,
            string apellido,
            string? email,
            string? celular,
            bool esTitularGrupo)
        {
            return new ef_invitados
            {
                id_evento = idEvento,
                id_acceso = idAcceso,
                id_acceso_link = idAccesoLink,
                id_rsvp_grupo = idRsvpGrupo,
                id_audiencia_persona = idAudienciaPersona,

                nombre = nombre.Trim(),
                apellido = apellido.Trim(),
                email = string.IsNullOrWhiteSpace(email) ? null : email.Trim(),
                celular = string.IsNullOrWhiteSpace(celular) ? null : celular.Trim(),

                rsvp_token = GenerarToken(32),
                qr_token = GenerarToken(32),

                rsvp_estado = "Y",
                fecha_rsvp = DateTimeOffset.UtcNow,

                es_titular_grupo = esTitularGrupo,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };
        }

        private async Task UpsertAudienciaPersonaEventoAsync(
            long idAudienciaPersona,
            long idEvento,
            long? idUnidad,
            long idInvitado,
            long? idAcceso,
            long? idAccesoLink,
            string origenRegistro)
        {
            var existe = await _context.Set<ef_audiencia_persona_eventos>()
                .FirstOrDefaultAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_invitado == idInvitado);

            if (existe == null)
            {
                existe = new ef_audiencia_persona_eventos
                {
                    id_audiencia_persona = idAudienciaPersona,
                    id_evento = idEvento,
                    id_unidad = idUnidad,
                    id_invitado = idInvitado,
                    id_acceso = idAcceso,
                    id_acceso_link = idAccesoLink,
                    origen_registro = origenRegistro,
                    registrado = true,
                    asistio = false,
                    beneficio_otorgado = false,
                    beneficio_canjeado = false,
                    fecha_registro = DateTimeOffset.UtcNow
                };

                _context.Set<ef_audiencia_persona_eventos>().Add(existe);
            }
            else
            {
                existe.id_audiencia_persona = idAudienciaPersona;
                existe.id_unidad = idUnidad;
                existe.id_acceso = idAcceso;
                existe.id_acceso_link = idAccesoLink;
                existe.origen_registro = origenRegistro;
                existe.registrado = true;
                existe.fecha_modif = DateTimeOffset.UtcNow;
            }
        }



        private async Task UpsertRestriccionAlimentariaIntegranteAsync(
            long idIntegrante,
            long idRestriccion,
            string? observacion)
        {
            var existe =
                await _context.Set<ef_rsvp_integrante_restricciones>()
                    .FirstOrDefaultAsync(x =>
                        x.id_rsvp_grupo_integrante == idIntegrante &&
                        x.id_restriccion_alim == idRestriccion);

            if (existe == null)
            {
                existe = new ef_rsvp_integrante_restricciones
                {
                    id_rsvp_grupo_integrante = idIntegrante,
                    id_restriccion_alim = idRestriccion,
                    observaciones = observacion,
                    severidad = null,
                    fecha_alta = DateTime.UtcNow
                };

                _context.Set<ef_rsvp_integrante_restricciones>()
                    .Add(existe);
            }
            else
            {
                existe.observaciones = observacion;
            }
        }

        private async Task GuardarSaludParticipanteAsync(
             long idInscripcion,
             long idIntegrante,
             ProgramaInscripcionSaludRequest salud)
        {
            var ficha = new ef_programa_inscripcion_salud_fichas
            {
                id_inscripcion = idInscripcion,
                id_rsvp_grupo_integrante = idIntegrante,

                tiene_problema_medico = salud.TieneProblemaMedico,
                problema_medico_detalle = salud.ProblemaMedicoDetalle,

                tiene_alergias_no_alimentarias =
                    salud.TieneAlergiasNoAlimentarias,

                alergias_no_alimentarias_detalle =
                    salud.AlergiasNoAlimentariasDetalle,

                necesidad_especial = salud.NecesidadEspecial,
                cobertura_medica = salud.CoberturaMedica,

                observaciones_familia = salud.ObservacionesFamilia,

                autoriza_emergencia_medica =
                    salud.AutorizaEmergenciaMedica,

                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Add(ficha);

            await _context.SaveChangesAsync();

            if (salud.ContactosEmergencia != null)
            {
                foreach (var c in salud.ContactosEmergencia)
                {
                    _context.Add(
                     new ef_programa_inscripcion_salud_contactos
                     {
                         id_salud_ficha = ficha.id_salud_ficha,
                         nombre = c.Nombre,
                         telefono = c.Telefono,
                         relacion = c.Relacion,
                         orden = c.Orden
                     });
                }
            }

            if (salud.Medicaciones != null)
            {
                foreach (var m in salud.Medicaciones)
                {
                    _context.Add(
                      new ef_programa_inscripcion_salud_medicaciones
                      {
                          id_salud_ficha = ficha.id_salud_ficha,
                          nombre_medicacion = m.NombreMedicacion,
                          dosis = m.Dosis,
                          frecuencia = m.Frecuencia,
                          horario = m.Horario,
                          indicaciones = m.Indicaciones,
                          requiere_autorizacion = m.RequiereAutorizacion
                      });
                }
            }
        }

        private async Task GuardarAceptacionLegalAsync(
            long idInscripcion,
            long? idIntegrante,
            long idProgramaAutorizacionConfig,
            bool aceptada,
            string? nombreFirmante,
            short idIdioma)
        {
            var config = await _context.Set<ef_programa_autorizaciones_config>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x =>
                    x.id_programa_autorizacion_config == idProgramaAutorizacionConfig &&
                    x.activo == true);

            if (config == null)
                throw new Exception("La autorización configurada no existe o está inactiva.");

            string? texto = await _context.Set<ef_programa_autorizacion_config_traducciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_programa_autorizacion_config == idProgramaAutorizacionConfig &&
                    x.id_idioma == idIdioma &&
                    x.activo == true)
                .Select(x => x.texto)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(texto) && config.id_autorizacion_base.HasValue)
            {
                texto = await _context.Set<ef_param_programa_autorizacion_base_traducciones>()
                    .AsNoTracking()
                    .Where(x =>
                        x.id_autorizacion_base == config.id_autorizacion_base.Value &&
                        x.id_idioma == idIdioma &&
                        x.activo == true)
                    .Select(x => x.texto)
                    .FirstOrDefaultAsync();
            }

            texto ??= config.codigo;

            var item = new ef_programa_inscripcion_autorizaciones
            {
                id_inscripcion = idInscripcion,
                id_rsvp_grupo_integrante = idIntegrante,
                id_programa_autorizacion_config = idProgramaAutorizacionConfig,
                codigo = config.codigo,
                texto_aceptado = texto,
                aceptada = aceptada,
                fecha_aceptacion = DateTimeOffset.UtcNow,
                nombre_firmante = string.IsNullOrWhiteSpace(nombreFirmante) ? null : nombreFirmante.Trim(),
                ip_aceptacion = HttpContext.Connection.RemoteIpAddress?.ToString(),
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_programa_inscripcion_autorizaciones>().Add(item);
        }

        [AllowAnonymous]
        [HttpPost("{token}/confirmar")]
        public async Task<ActionResult<ProgramaInscripcionConfirmarResponse>> Confirmar(
            string token,
            [FromBody] ProgramaInscripcionConfirmarRequest req)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token obligatorio.");

            if (req.Responsable == null)
                return BadRequest("Debe informar el responsable.");

            if (string.IsNullOrWhiteSpace(req.Responsable.Nombre))
                return BadRequest("Debe informar el nombre del responsable.");

            if (string.IsNullOrWhiteSpace(req.Responsable.Apellido))
                return BadRequest("Debe informar el apellido del responsable.");

            if (req.Participantes == null || req.Participantes.Count == 0)
                return BadRequest("Debe informar al menos un participante.");

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

            if (data.link.fecha_expiracion.HasValue &&
                data.link.fecha_expiracion.Value < DateTimeOffset.UtcNow)
                return BadRequest("El link de inscripción está expirado.");

            await using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                long idEvento = data.ev.id_evento;
                long idAcceso = data.acceso.id_acceso;
                long? idAccesoLink = data.link.id_acceso_link;
                long idCuenta = data.ev.id_cuenta ?? 0;
                long? idUnidad = data.ev.id_unidad;

                if (idCuenta <= 0)
                    return BadRequest("El programa no tiene cuenta asociada. No se puede registrar audiencia.");

                var now = DateTimeOffset.UtcNow;

                var qrTokensPorAutorizado = new Dictionary<string, string>();
                var autorizacionesRetiroCreadas = new List<ef_autorizaciones>();
                var nombresInvitadosParticipantes = new Dictionary<long, string>();

                // 1. Audiencia responsable
                var audienciaResponsable = await UpsertAudienciaPersonaAsync(
                    idCuenta: idCuenta,
                    nombre: req.Responsable.Nombre,
                    apellido: req.Responsable.Apellido,
                    email: req.Responsable.Email,
                    celular: req.Responsable.Telefono,
                    fechaNacimiento: null,
                    aceptaComunicaciones: req.Responsable.AceptaComunicaciones,
                    aceptaPromociones: req.Responsable.AceptaPromociones
                );

                await _context.SaveChangesAsync();

                // 2. Grupo RSVP / grupo familiar
                var nombreGrupo = "Familia " + req.Responsable.Apellido.Trim();

                var grupo = new ef_rsvp_grupos
                {
                    id_evento = idEvento,
                    id_acceso = idAcceso,
                    id_acceso_link = idAccesoLink,

                    max_personas_total = data.link.max_personas_total,
                    max_adultos = data.link.max_adultos,

                    cantidad_total = req.Participantes.Count + 1,

                    rsvp_estado = "Y",
                    fecha_rsvp = now,
                    rsvp_mensaje = "Inscripción pública de programa.",

                    activo = true,
                    fecha_alta = now,

                    nombre_grupo = nombreGrupo,
                    cant_adultos_sin_nombre = 0,
                    cant_menores_sin_nombre = 0
                };

                _context.Set<ef_rsvp_grupos>().Add(grupo);
                await _context.SaveChangesAsync();

                // 3. Invitado responsable
                var invitadoResponsable = CrearInvitadoPrograma(
                    idEvento: idEvento,
                    idAcceso: idAcceso,
                    idAccesoLink: idAccesoLink,
                    idRsvpGrupo: grupo.id_rsvp_grupo,
                    idAudienciaPersona: audienciaResponsable.id_audiencia_persona,
                    nombre: req.Responsable.Nombre,
                    apellido: req.Responsable.Apellido,
                    email: req.Responsable.Email,
                    celular: req.Responsable.Telefono,
                    esTitularGrupo: true
                );

                _context.Set<ef_invitados>().Add(invitadoResponsable);
                await _context.SaveChangesAsync();

                // 4. Integrante responsable
                var integranteResponsable = new ef_rsvp_grupo_integrantes
                {
                    id_rsvp_grupo = grupo.id_rsvp_grupo,
                    id_invitado = invitadoResponsable.id_invitado,
                    rol = "T",
                    orden = 1,
                    requiere_asistencia = false,
                    rol_evento = "A",
                    asiste = "Y",
                    fecha_respuesta = now
                };

                _context.Set<ef_rsvp_grupo_integrantes>().Add(integranteResponsable);

                // 5. Registrar audiencia responsable en evento
                await UpsertAudienciaPersonaEventoAsync(
                    idAudienciaPersona: audienciaResponsable.id_audiencia_persona,
                    idEvento: idEvento,
                    idUnidad: idUnidad,
                    idInvitado: invitadoResponsable.id_invitado,
                    idAcceso: idAcceso,
                    idAccesoLink: idAccesoLink,
                    origenRegistro: "PROGRAMA_INSCRIPCION"
                );

                // 6. Inscripción cabecera familiar
                var tokenConsulta = GenerarToken(32);

                var monedaPrograma = await _context.Set<ef_cuentas>()
                    .AsNoTracking()
                    .Where(x => x.id_cuenta == idCuenta)
                    .Select(x => x.moneda_default)
                    .FirstOrDefaultAsync();

                monedaPrograma = string.IsNullOrWhiteSpace(monedaPrograma)
                    ? "ARS"
                    : monedaPrograma.Trim().ToUpper();

                var inscripcion = new ef_programa_inscripciones
                {
                    id_evento = idEvento,
                    id_acceso = idAcceso,
                    id_acceso_link = idAccesoLink,

                    id_rsvp_grupo = grupo.id_rsvp_grupo,

                    id_invitado_responsable = invitadoResponsable.id_invitado,
                    id_audiencia_persona_responsable = audienciaResponsable.id_audiencia_persona,

                    responsable_nombre = req.Responsable.Nombre.Trim(),
                    responsable_apellido = req.Responsable.Apellido.Trim(),
                    responsable_email = string.IsNullOrWhiteSpace(req.Responsable.Email) ? null : req.Responsable.Email.Trim(),
                    responsable_telefono = string.IsNullOrWhiteSpace(req.Responsable.Telefono) ? null : req.Responsable.Telefono.Trim(),
                    responsable_documento = string.IsNullOrWhiteSpace(req.Responsable.Documento) ? null : req.Responsable.Documento.Trim(),
                    responsable_relacion = string.IsNullOrWhiteSpace(req.Responsable.Relacion) ? null : req.Responsable.Relacion.Trim(),

                    firma_nombre = req.Firma == null || string.IsNullOrWhiteSpace(req.Firma.Nombre)
                        ? null
                        : req.Firma.Nombre.Trim(),

                    firma_fecha = req.Firma?.Fecha,

                    estado = "BORRADOR",

                    id_idioma = req.IdIdioma ?? data.ev.id_idioma,

                    moneda = monedaPrograma,
                    total_base = 0,
                    total_servicios = 0,
                    total_general = 0,

                    token_consulta = tokenConsulta,

                    activo = true,
                    fecha_alta = now
                };

                _context.Set<ef_programa_inscripciones>().Add(inscripcion);

                await _context.SaveChangesAsync();

                var ordenIntegrante = 2;

                foreach (var p in req.Participantes)
                {
                    if (string.IsNullOrWhiteSpace(p.Nombre))
                        return BadRequest("Debe informar el nombre de todos los participantes.");

                    if (string.IsNullOrWhiteSpace(p.Apellido))
                        return BadRequest("Debe informar el apellido de todos los participantes.");

                    if (p.Periodos == null || p.Periodos.Count == 0)
                        return BadRequest($"Debe seleccionar al menos un período para {p.Nombre}.");

                    // 1. Audiencia participante / hijo
                    var audienciaParticipante = await UpsertAudienciaPersonaAsync(
                        idCuenta: idCuenta,
                        nombre: p.Nombre,
                        apellido: p.Apellido,
                        email: null,
                        celular: null,
                        fechaNacimiento: p.FechaNacimiento,
                        aceptaComunicaciones: false,
                        aceptaPromociones: false
                    );

                    await _context.SaveChangesAsync();

                    // 2. Invitado participante / hijo
                    var invitadoParticipante = CrearInvitadoPrograma(
                        idEvento: idEvento,
                        idAcceso: idAcceso,
                        idAccesoLink: idAccesoLink,
                        idRsvpGrupo: grupo.id_rsvp_grupo,
                        idAudienciaPersona: audienciaParticipante.id_audiencia_persona,
                        nombre: p.Nombre,
                        apellido: p.Apellido,
                        email: null,
                        celular: null,
                        esTitularGrupo: false
                    );

                    _context.Set<ef_invitados>().Add(invitadoParticipante);
                    await _context.SaveChangesAsync();

                    nombresInvitadosParticipantes[invitadoParticipante.id_invitado] =
                        (invitadoParticipante.nombre + " " + invitadoParticipante.apellido).Trim();

                    // 3. Calcular edad aproximada para ef_rsvp_grupo_integrantes
                    short? edadAnios = null;

                    if (p.FechaNacimiento.HasValue)
                    {
                        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
                        var edad = hoy.Year - p.FechaNacimiento.Value.Year;

                        if (p.FechaNacimiento.Value > hoy.AddYears(-edad))
                            edad--;

                        if (edad >= 0 && edad <= short.MaxValue)
                            edadAnios = (short)edad;
                    }

                    // 4. Integrante participante / hijo
                    var integranteParticipante = new ef_rsvp_grupo_integrantes
                    {
                        id_rsvp_grupo = grupo.id_rsvp_grupo,
                        id_invitado = invitadoParticipante.id_invitado,

                        // T = titular, A = acompañante. Para no romper constraint existente usamos A.
                        rol = "A",

                        orden = ordenIntegrante,
                        requiere_asistencia = true,

                        edad_anios = edadAnios,
                        id_evento_edad_rango = null,

                        alimentacion_detalle = null,

                        // Por ahora usamos A porque ya es el default de tu entity.
                        rol_evento = "A",

                        asiste = "Y",
                        fecha_respuesta = now
                    };

                    _context.Set<ef_rsvp_grupo_integrantes>().Add(integranteParticipante);
                    await _context.SaveChangesAsync();

                    var idsPeriodosParticipante = p.Periodos
                        .Select(x => x.IdProgramaPeriodo)
                        .Distinct()
                        .ToList();

                    var periodosDb = await _context.Set<ef_programa_periodos>()
                        .AsNoTracking()
                        .Where(x =>
                            x.id_evento == idEvento &&
                            x.activo == true &&
                            idsPeriodosParticipante.Contains(x.id_programa_periodo))
                        .ToListAsync();

                    if (periodosDb.Count != idsPeriodosParticipante.Count)
                        return BadRequest($"Uno o más períodos seleccionados para {p.Nombre} no existen o no están activos.");

                    foreach (var periodo in periodosDb)
                    {
                        var inscPeriodo = new ef_programa_inscripcion_periodos
                        {
                            id_inscripcion = inscripcion.id_inscripcion,
                            id_rsvp_grupo_integrante = integranteParticipante.id_rsvp_grupo_integrante,
                            id_programa_periodo = periodo.id_programa_periodo,

                            codigo = periodo.codigo,
                            nombre = periodo.nombre,
                            fecha_desde = periodo.fecha_desde,
                            fecha_hasta = periodo.fecha_hasta,
                            precio_base = periodo.precio_base,
                            moneda = periodo.moneda,

                            activo = true,
                            fecha_alta = now
                        };

                        _context.Set<ef_programa_inscripcion_periodos>().Add(inscPeriodo);

                        inscripcion.total_base += periodo.precio_base;
                    }

                    if (p.Servicios != null && p.Servicios.Any())
                    {
                        var idsServicios = p.Servicios
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
                            return BadRequest($"Uno o más servicios seleccionados para {p.Nombre} no existen.");

                        foreach (var srvReq in p.Servicios)
                        {
                            var srvDb = serviciosDb
                                .Single(x => x.id_programa_servicio == srvReq.IdProgramaServicio);

                            decimal subtotal = 0m;

                            if (srvDb.tipo_calculo == "POR_DIA")
                            {
                                subtotal = (srvReq.Fechas?.Count ?? 0) * srvDb.precio;
                            }
                            else if (srvDb.tipo_calculo == "POR_CANTIDAD")
                            {
                                subtotal = (srvReq.Cantidad ?? 0) * srvDb.precio;
                            }
                            else
                            {
                                subtotal = srvDb.precio;
                            }

                            string? camposExtraJson = null;

                            if (srvReq.CamposExtra != null && srvReq.CamposExtra.Any())
                            {
                                camposExtraJson =
                                    System.Text.Json.JsonSerializer.Serialize(
                                        srvReq.CamposExtra
                                    );
                            }

                            var inscServicio = new ef_programa_inscripcion_servicios
                            {
                                id_inscripcion = inscripcion.id_inscripcion,
                                id_rsvp_grupo_integrante = integranteParticipante.id_rsvp_grupo_integrante,
                                id_programa_servicio = srvDb.id_programa_servicio,
                                id_programa_periodo = srvReq.IdProgramaPeriodo,

                                codigo = srvDb.codigo,
                                nombre = srvDb.nombre,
                                tipo_calculo = srvDb.tipo_calculo,

                                precio = srvDb.precio,
                                moneda = srvDb.moneda,

                                cantidad = srvReq.Cantidad,
                                campos_extra_json = camposExtraJson,

                                subtotal = subtotal,

                                activo = true,
                                fecha_alta = now
                            };

                            _context.Set<ef_programa_inscripcion_servicios>()
                                .Add(inscServicio);

                            await _context.SaveChangesAsync();

                            // días seleccionados para servicios POR_DIA
                            if (srvReq.Fechas != null &&
                                srvReq.Fechas.Any())
                            {
                                foreach (var fecha in srvReq.Fechas.Distinct())
                                {
                                    var dia = new ef_programa_inscripcion_servicio_dias
                                    {
                                        id_inscripcion_servicio = inscServicio.id_inscripcion_servicio,
                                        fecha = fecha,
                                        activo = true,
                                        fecha_alta = now
                                    };

                                    _context.Set<ef_programa_inscripcion_servicio_dias>()
                                        .Add(dia);
                                }
                            }

                            inscripcion.total_servicios += subtotal;
                        }
                    }

                    if (p.RestriccionesAlimentarias != null &&
                        p.RestriccionesAlimentarias.Any())
                    {
                        foreach (var r in p.RestriccionesAlimentarias)
                        {
                            await UpsertRestriccionAlimentariaIntegranteAsync(
                                idIntegrante: integranteParticipante.id_rsvp_grupo_integrante,
                                idRestriccion: r.IdRestriccionAlimentaria,
                                observacion: r.Observacion
                            );
                        }
                    }

                    if (p.Salud != null)
                    {
                        await GuardarSaludParticipanteAsync(
                           inscripcion.id_inscripcion,
                           integranteParticipante.id_rsvp_grupo_integrante,
                           p.Salud
                        );
                    }

                    if (p.AutorizadosRetiro != null && p.AutorizadosRetiro.Any())
                    {
                        foreach (var a in p.AutorizadosRetiro)
                        {
                            if (string.IsNullOrWhiteSpace(a.NombreAutorizado))
                                continue;

                            var nombreAut = a.NombreAutorizado.Trim();

                            var telAut = string.IsNullOrWhiteSpace(a.TelefonoAutorizado)
                                ? ""
                                : a.TelefonoAutorizado.Trim();

                            var claveAutorizado = (nombreAut + "|" + telAut).ToUpperInvariant();

                            if (!qrTokensPorAutorizado.ContainsKey(claveAutorizado))
                                qrTokensPorAutorizado[claveAutorizado] = GenerarToken(32);

                            var autorizado = new ef_autorizaciones
                            {
                                id_evento = idEvento,
                                id_invitado_objetivo = invitadoParticipante.id_invitado,
                                tipo = "R",
                                nombre_autorizado = nombreAut,
                                telefono_autorizado = string.IsNullOrWhiteSpace(a.TelefonoAutorizado) ? null : a.TelefonoAutorizado.Trim(),
                                relacion = string.IsNullOrWhiteSpace(a.Relacion) ? null : a.Relacion.Trim(),
                                observaciones = string.IsNullOrWhiteSpace(a.Observaciones) ? null : a.Observaciones.Trim(),
                                qr_token = qrTokensPorAutorizado[claveAutorizado],
                                activo = true,
                                fecha_alta = now
                            };

                            _context.Set<ef_autorizaciones>().Add(autorizado);
                            autorizacionesRetiroCreadas.Add(autorizado);
                        }
                    }

                    if (p.Autorizaciones != null && p.Autorizaciones.Any())
                    {
                        foreach (var autReq in p.Autorizaciones)
                        {
                            await GuardarAceptacionLegalAsync(
                                idInscripcion: inscripcion.id_inscripcion,
                                idIntegrante: integranteParticipante.id_rsvp_grupo_integrante,
                                idProgramaAutorizacionConfig: autReq.IdProgramaAutorizacionConfig,
                                aceptada: autReq.Aceptada,
                                nombreFirmante: req.Firma?.Nombre ?? req.Responsable.Nombre + " " + req.Responsable.Apellido,
                                idIdioma: req.IdIdioma ?? data.ev.id_idioma
                            );
                        }
                    }



                    // 5. Registrar audiencia participante en evento
                    await UpsertAudienciaPersonaEventoAsync(
                        idAudienciaPersona: audienciaParticipante.id_audiencia_persona,
                        idEvento: idEvento,
                        idUnidad: idUnidad,
                        idInvitado: invitadoParticipante.id_invitado,
                        idAcceso: idAcceso,
                        idAccesoLink: idAccesoLink,
                        origenRegistro: "PROGRAMA_INSCRIPCION"
                    );

                    ordenIntegrante++;
                }

                if (req.AutorizacionesGrupo != null && req.AutorizacionesGrupo.Any())
                {
                    foreach (var autReq in req.AutorizacionesGrupo)
                    {
                        await GuardarAceptacionLegalAsync(
                            idInscripcion: inscripcion.id_inscripcion,
                            idIntegrante: null,
                            idProgramaAutorizacionConfig: autReq.IdProgramaAutorizacionConfig,
                            aceptada: autReq.Aceptada,
                            nombreFirmante: req.Firma?.Nombre ?? req.Responsable.Nombre + " " + req.Responsable.Apellido,
                            idIdioma: req.IdIdioma ?? data.ev.id_idioma
                        );
                    }
                }

                inscripcion.total_general = inscripcion.total_base + inscripcion.total_servicios;
                inscripcion.estado = "CONFIRMADA";
                inscripcion.fecha_confirmacion = now;
                inscripcion.fecha_modif = now;

                grupo.cantidad_total = req.Participantes.Count + 1;
                grupo.fecha_modif = now;

                await _context.SaveChangesAsync();

                var qrsRetiroDto = autorizacionesRetiroCreadas
                .Where(x => !string.IsNullOrWhiteSpace(x.qr_token))
                .GroupBy(x => new
                {
                    x.nombre_autorizado,
                    x.telefono_autorizado,
                    x.relacion,
                    x.qr_token
                })
                .Select(g => new ProgramaInscripcionQrRetiroDTO
                {
                    NombreAutorizado = g.Key.nombre_autorizado,
                    TelefonoAutorizado = g.Key.telefono_autorizado,
                    Relacion = g.Key.relacion,
                    QrToken = g.Key.qr_token!,
                    Participantes = g.Select(x => new ProgramaInscripcionQrParticipanteDTO
                    {
                        IdInvitado = x.id_invitado_objetivo,
                        NombreCompleto = nombresInvitadosParticipantes.ContainsKey(x.id_invitado_objetivo)
                            ? nombresInvitadosParticipantes[x.id_invitado_objetivo]
                            : ""
                    }).ToList()
                })
                .ToList();

                await tx.CommitAsync();

                return Ok(new ProgramaInscripcionConfirmarResponse
                {
                    Ok = true,
                    IdInscripcion = inscripcion.id_inscripcion,
                    IdRsvpGrupo = grupo.id_rsvp_grupo,
                    TokenConsulta = tokenConsulta,
                    TotalGeneral = inscripcion.total_general,
                    Mensaje = "Inscripción familiar creada correctamente.",
                    QrsRetiro = qrsRetiroDto
                });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
    }
}