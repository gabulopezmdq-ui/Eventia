using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using API.Utility;
using System.Linq;
using API.Services.Planes;
using API.DataSchema.DTO.Invitados;


using System.Collections.Generic;

namespace API.Services
{
    public class InvitacionService : IInvitacionService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;
        private readonly IRestriccionesService _restriccionesService;

        public InvitacionService(DataContext context, IConfiguration config, IRestriccionesService restriccionesService)
        {
            _context = context;
            _config = config;
            _restriccionesService = restriccionesService;
        }

        public async Task ConfirmarAsync(string token, RsvpConfirmacionDTO datos)
        {
            token = token?.Trim();

            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Token de invitación inválido (vacío)");

            if (datos == null)
                throw new Exception("Body inválido.");

            if (datos.Personas == null || !datos.Personas.Any())
                throw new Exception("Debe informar al menos una persona.");

            var titular = await _context.ef_invitados
                .FirstOrDefaultAsync(x =>
                    x.rsvp_token.ToLower() == token.ToLower()
                    && x.activo);

            if (titular == null)
                throw new Exception($"Invitación no encontrada o token inválido para: {token}");

            if (titular.id_rsvp_grupo == null)
                throw new Exception("El invitado no pertenece a ningún grupo RSVP");

            var grupo = await _context.ef_rsvp_grupos
                .Include(g => g.integrantes)
                    .ThenInclude(i => i.invitado)
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == titular.id_rsvp_grupo);

            if (grupo == null)
                throw new Exception("Grupo inexistente");

            if (grupo.grupo_cerrado)
                throw new Exception("El grupo RSVP ya fue cerrado. No se pueden agregar más acompañantes.");

            var ahora = DateTimeOffset.UtcNow;
            var matchedIds = new HashSet<long>();

            await using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var persona in datos.Personas)
                {
                    ef_rsvp_grupo_integrantes? integranteExistente = null;

                    if (persona.IdInvitado > 0)
                    {
                        integranteExistente = grupo.integrantes
                            .FirstOrDefault(i => i.id_invitado == persona.IdInvitado);
                    }
                    else
                    {
                        if (!string.IsNullOrWhiteSpace(persona.Email))
                        {
                            var email = persona.Email.Trim().ToLower();

                            var invExistente = await _context.ef_invitados
                                .FirstOrDefaultAsync(i =>
                                    i.id_rsvp_grupo == grupo.id_rsvp_grupo
                                    && i.email != null
                                    && i.email.ToLower() == email
                                    && i.activo);

                            if (invExistente != null)
                            {
                                integranteExistente = grupo.integrantes
                                    .FirstOrDefault(i => i.id_invitado == invExistente.id_invitado);

                                if (integranteExistente == null)
                                {
                                    integranteExistente = await _context.ef_rsvp_grupo_integrantes
                                        .Include(i => i.invitado)
                                        .FirstOrDefaultAsync(i => i.id_invitado == invExistente.id_invitado);

                                    if (integranteExistente != null)
                                        grupo.integrantes.Add(integranteExistente);
                                }
                            }
                        }
                        else
                        {
                            integranteExistente = grupo.integrantes
                                .FirstOrDefault(i =>
                                    i.invitado != null
                                    && !matchedIds.Contains(i.id_invitado)
                                    && string.Equals(i.invitado.nombre?.Trim(), persona.Nombre?.Trim(), StringComparison.OrdinalIgnoreCase)
                                    && string.Equals(i.invitado.apellido?.Trim(), persona.Apellido?.Trim(), StringComparison.OrdinalIgnoreCase));
                        }
                    }

                    if (integranteExistente != null)
                    {
                        matchedIds.Add(integranteExistente.id_invitado);

                        integranteExistente.asiste = persona.Asiste ? "Y" : "N";
                        integranteExistente.fecha_respuesta = ahora;

                        if (!string.IsNullOrWhiteSpace(persona.RolEvento))
                            integranteExistente.rol_evento = persona.RolEvento;

                        var invitado = integranteExistente.invitado;

                        invitado.email = persona.Email ?? invitado.email;
                        invitado.celular = persona.Celular ?? invitado.celular;
                        invitado.rsvp_estado = integranteExistente.asiste;
                        invitado.rsvp_mensaje = persona.Mensaje;
                        invitado.fecha_rsvp = ahora;
                        invitado.fecha_modif = ahora;

                        integranteExistente.edad_anios = (short?)(persona.Edad ?? integranteExistente.edad_anios);
                        integranteExistente.alimentacion_detalle =
                            persona.AlimentacionDetalle ?? integranteExistente.alimentacion_detalle;

                        if (persona.Restricciones != null)
                        {
                            await GuardarRestriccionesDetalladasAsync(
                                integranteExistente.id_rsvp_grupo_integrante,
                                persona.Restricciones);
                        }
                        else if (persona.IdsRestricciones != null)
                        {
                            await GuardarRestriccionesDetalladasAsync(
                                integranteExistente.id_rsvp_grupo_integrante,
                                persona.IdsRestricciones
                                    .Select(id => new RestriccionSeleccionadaDTO { IdRestriccion = id })
                                    .ToList());
                        }
                    }
                    else
                    {
                        var rolEvento = string.IsNullOrWhiteSpace(persona.RolEvento)
                            ? "A"
                            : persona.RolEvento.Trim().ToUpperInvariant();

                        if (rolEvento != "A" && rolEvento != "N")
                            throw new Exception("RolEvento inválido. Valores permitidos: A adulto, N menor.");

                        var adultosInvitados = 1 + (grupo.cant_adultos_sin_nombre ?? 0);
                        var menoresInvitados = grupo.cant_menores_sin_nombre ?? 0;

                        var adultosCargados = grupo.integrantes.Count(x => x.rol_evento == "A");
                        var menoresCargados = grupo.integrantes.Count(x => x.rol_evento == "N");

                        if (rolEvento == "A" && adultosCargados >= adultosInvitados)
                            throw new Exception("No hay cupos adultos disponibles en el grupo.");

                        if (rolEvento == "N" && menoresCargados >= menoresInvitados)
                            throw new Exception("No hay cupos menores disponibles en el grupo.");

                        var ocupacionActual = grupo.integrantes.Count;
                        var maxTotal = grupo.max_personas_total;

                        if (ocupacionActual >= maxTotal)
                            throw new Exception($"No hay cupos disponibles en el grupo (máximo: {maxTotal}).");

                        var helper = new PlanLimitesHelper(_context);
                        var maxInv = await helper.GetLimiteIntByEventoAsync(titular.id_evento, "MAX_INVITADOS");

                        if (maxInv.HasValue && maxInv.Value > 0)
                        {
                            var actuales = await _context.ef_invitados
                                .AsNoTracking()
                                .Where(i =>
                                    i.id_evento == titular.id_evento
                                    && i.activo == true
                                    && i.es_staff == false)
                                .CountAsync();

                            if (actuales >= maxInv.Value)
                                throw new Exception($"El evento alcanzó el máximo de invitados permitido por el plan ({maxInv.Value}).");
                        }

                        var nuevoInvitado = new ef_invitados
                        {
                            id_evento = titular.id_evento,
                            id_acceso = titular.id_acceso,
                            nombre = persona.Nombre,
                            apellido = persona.Apellido,
                            email = persona.Email,
                            celular = persona.Celular,
                            activo = true,
                            fecha_alta = ahora,
                            id_usuario_invitador = titular.id_usuario_invitador,
                            qr_token = TokenUtility.Generate(64),
                            id_rsvp_grupo = grupo.id_rsvp_grupo,
                            es_titular_grupo = false,
                            rsvp_estado = persona.Asiste ? "Y" : "N",
                            rsvp_mensaje = persona.Mensaje,
                            fecha_rsvp = ahora,
                            fecha_modif = ahora
                        };

                        _context.ef_invitados.Add(nuevoInvitado);
                        await _context.SaveChangesAsync();

                        var nuevoIntegrante = new ef_rsvp_grupo_integrantes
                        {
                            id_rsvp_grupo = grupo.id_rsvp_grupo,
                            id_invitado = nuevoInvitado.id_invitado,
                            rol = "A",
                            orden = grupo.integrantes.Count + 1,
                            rol_evento = rolEvento,
                            asiste = persona.Asiste ? "Y" : "N",
                            edad_anios = (short?)persona.Edad,
                            alimentacion_detalle = persona.AlimentacionDetalle,
                            fecha_respuesta = ahora
                        };

                        _context.ef_rsvp_grupo_integrantes.Add(nuevoIntegrante);
                        await _context.SaveChangesAsync();

                        if (persona.Restricciones != null)
                        {
                            await GuardarRestriccionesDetalladasAsync(
                                nuevoIntegrante.id_rsvp_grupo_integrante,
                                persona.Restricciones);
                        }
                        else if (persona.IdsRestricciones != null)
                        {
                            await GuardarRestriccionesDetalladasAsync(
                                nuevoIntegrante.id_rsvp_grupo_integrante,
                                persona.IdsRestricciones
                                    .Select(id => new RestriccionSeleccionadaDTO { IdRestriccion = id })
                                    .ToList());
                        }

                        grupo.integrantes.Add(nuevoIntegrante);
                    }
                }

                var estados = grupo.integrantes
                    .Select(x => x.asiste)
                    .ToList();

                var adultosInvitadosFinal = 1 + (grupo.cant_adultos_sin_nombre ?? 0);
                var menoresInvitadosFinal = grupo.cant_menores_sin_nombre ?? 0;
                var cuposInvitadosFinal = adultosInvitadosFinal + menoresInvitadosFinal;

                var personasCargadasFinal = grupo.integrantes.Count;
                var cuposSinDefinirFinal = Math.Max(0, cuposInvitadosFinal - personasCargadasFinal);

                if (grupo.grupo_cerrado)
                {
                    if (estados.Any() && estados.All(x => x == "N"))
                    {
                        grupo.rsvp_estado = "N";
                    }
                    else if (cuposSinDefinirFinal == 0 && estados.Any() && estados.All(x => x == "Y"))
                    {
                        grupo.rsvp_estado = "Y";
                    }
                    else
                    {
                        grupo.rsvp_estado = "P";
                    }
                }
                else
                {
                    if (cuposSinDefinirFinal > 0)
                    {
                        grupo.rsvp_estado = "P";
                    }
                    else if (estados.Any() && estados.All(x => x == "Y"))
                    {
                        grupo.rsvp_estado = "Y";
                    }
                    else if (estados.Any() && estados.All(x => x == "N"))
                    {
                        grupo.rsvp_estado = "N";
                    }
                    else
                    {
                        grupo.rsvp_estado = "P";
                    }
                }

                grupo.rsvp_mensaje = datos.MensajeGrupo;
                grupo.fecha_rsvp = ahora;
                grupo.fecha_modif = ahora;

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<ResumenRsvpDTO> CerrarGrupoRsvpAsync(string token, CerrarGrupoRsvpRequest request)
        {
            token = token?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Token inválido.");

            var titular = await _context.ef_invitados
                .FirstOrDefaultAsync(x =>
                    x.rsvp_token != null &&
                    x.rsvp_token.ToLower() == token.ToLower() &&
                    x.activo == true);

            if (titular == null)
                throw new Exception("Invitación no encontrada.");

            if (titular.id_rsvp_grupo == null)
                throw new Exception("La invitación no pertenece a un grupo RSVP.");

            var grupo = await _context.ef_rsvp_grupos
                .Include(g => g.integrantes)
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == titular.id_rsvp_grupo.Value);

            if (grupo == null)
                throw new Exception("Grupo RSVP inexistente.");

            var ahora = DateTimeOffset.UtcNow;

            grupo.grupo_cerrado = true;
            grupo.fecha_cierre = ahora;
            grupo.observaciones_cierre = request?.Observaciones;

            var estados = grupo.integrantes.Select(x => x.asiste).ToList();

            if (estados.Any() && estados.All(x => x == "N"))
                grupo.rsvp_estado = "N";
            else if (estados.Any(x => x == "Y"))
                grupo.rsvp_estado = "Y";
            else
                grupo.rsvp_estado = "P";

            grupo.fecha_modif = ahora;

            await _context.SaveChangesAsync();

            return await ObtenerResumenRsvpAsync(token);
        }

        private async Task GuardarRestriccionesDetalladasAsync(long idIntegrante, List<RestriccionSeleccionadaDTO> restricciones)
        {
            // Borramos existentes y re-insertamos
            var existentes = await _context.ef_rsvp_integrante_restricciones
                .Where(x => x.id_rsvp_grupo_integrante == idIntegrante)
                .ToListAsync();

            if (existentes.Any())
                _context.ef_rsvp_integrante_restricciones.RemoveRange(existentes);

            foreach (var r in restricciones)
            {
                _context.ef_rsvp_integrante_restricciones.Add(new ef_rsvp_integrante_restricciones
                {
                    id_rsvp_grupo_integrante = idIntegrante,
                    id_restriccion_alim = r.IdRestriccion,
                    observaciones = r.Observaciones,
                    fecha_alta = DateTime.UtcNow
                });
            }
        }

        private async Task GuardarRestriccionesManualAsync(long idIntegrante, List<long> idsRestricciones)
        {
            await GuardarRestriccionesDetalladasAsync(idIntegrante, idsRestricciones.Select(id => new RestriccionSeleccionadaDTO { IdRestriccion = id }).ToList());
        }

        public async Task CargarInvitadosAsync(CrearGrupoInvitacionRequest req, long idUsuario)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.IdEvento <= 0) throw new Exception("IdEvento inválido.");
            if (req.IdAcceso <= 0) throw new Exception("IdAcceso inválido.");
            if (req.Personas == null || req.Personas.Count == 0) throw new Exception("Debe informar al menos 1 persona.");
            if (req.MaxPersonasTotal <= 0) throw new Exception("MaxPersonasTotal inválido.");
            if (req.CantAdultosSinNombre < 0 || req.CantMenoresSinNombre < 0) throw new Exception("Cantidades sin nombre inválidas.");

            //// Seguridad: el usuario debe pertenecer al evento
            //bool pertenece = await _context.Set<ef_evento_usuarios>()
            //    .AsNoTracking()
            //    .AnyAsync(x => x.id_evento == req.IdEvento && x.id_usuario == idUsuario && x.activo == true);

            var evento = await _context.ef_eventos.FindAsync(req.IdEvento);

            if (evento == null)
                throw new Exception("Evento inexistente");

            // =====================================================
            // LIMITES POR PLAN (Free y otros)
            // - Reservamos cupo por grupo: actuales + MaxPersonasTotal <= límite
            // - Si no existe el límite en BD, no bloquea
            // =====================================================
            var helper = new PlanLimitesHelper(_context);

            int? maxManual = await helper.GetLimiteIntByEventoAsync(req.IdEvento, "MAX_INVITADOS_MANUAL");
            int? maxTotal = await helper.GetLimiteIntByEventoAsync(req.IdEvento, "MAX_INVITADOS");

            int? limite = null;
            if (maxManual.HasValue && maxManual.Value > 0) limite = maxManual.Value;
            if (maxTotal.HasValue && maxTotal.Value > 0) limite = limite.HasValue ? Math.Min(limite.Value, maxTotal.Value) : maxTotal.Value;

            if (limite.HasValue)
            {
                // invitados actuales (excluimos staff)
                var actuales = await _context.ef_invitados
                    .AsNoTracking()
                    .Where(i => i.id_evento == req.IdEvento && i.activo == true && i.es_staff == false)
                    .CountAsync();

                // “reservamos” lo que va a permitir el grupo (incluye sin nombre)
                if (actuales + req.MaxPersonasTotal > limite.Value)
                {
                    throw new Exception(
                        $"Tu plan permite hasta {limite.Value} invitados en total. " +
                        $"Actualmente tenés {actuales} y este grupo permite {req.MaxPersonasTotal}. " +
                        $"Reducí el cupo o actualizá el plan."
                    );
                }

                // además, no dejes que el grupo declare un cupo mayor al límite
                if (req.MaxPersonasTotal > limite.Value)
                {
                    throw new Exception(
                        $"Tu plan permite hasta {limite.Value} invitados. " +
                        $"MaxPersonasTotal no puede ser mayor a {limite.Value}."
                    );
                }
            }



            var ahora = DateTimeOffset.UtcNow;

            await using var tx = await _context.Database.BeginTransactionAsync();

            var grupo = new ef_rsvp_grupos
            {
                id_evento = req.IdEvento,
                id_acceso = req.IdAcceso,
                nombre_grupo = req.NombreGrupo,
                max_personas_total = req.MaxPersonasTotal,
                max_adultos = req.Personas.Count(x => x.RolEvento == "A"), // solo adultos conocidos
                cant_adultos_sin_nombre = req.CantAdultosSinNombre,
                cant_menores_sin_nombre = req.CantMenoresSinNombre,
                cantidad_total = req.MaxPersonasTotal,
                rsvp_estado = "P",
                fecha_alta = ahora,
                activo = true
            };

            _context.ef_rsvp_grupos.Add(grupo);
            await _context.SaveChangesAsync();

            int orden = 1;

            foreach (var persona in req.Personas)
            {
                var invitado = new ef_invitados
                {
                    id_evento = req.IdEvento,
                    nombre = persona.Nombre,
                    apellido = persona.Apellido,
                    email = persona.Email,
                    celular = persona.Celular,
                    id_acceso = req.IdAcceso,
                    rsvp_estado = "P",
                    rsvp_token = persona.Titular ? TokenUtility.Generate(64) : null,
                    qr_token = TokenUtility.Generate(64),
                    fecha_alta = ahora,
                    activo = true,
                    id_usuario_invitador = idUsuario,
                    id_rsvp_grupo = grupo.id_rsvp_grupo,
                    es_titular_grupo = persona.Titular
                };

                _context.ef_invitados.Add(invitado);
                await _context.SaveChangesAsync();

                var integrante = new ef_rsvp_grupo_integrantes
                {
                    id_rsvp_grupo = grupo.id_rsvp_grupo,
                    id_invitado = invitado.id_invitado,
                    rol = persona.Titular ? "T" : "A",
                    orden = orden++,
                    rol_evento = persona.RolEvento,
                    asiste = "P"
                };

                _context.ef_rsvp_grupo_integrantes.Add(integrante);
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
        public async Task<List<InvitadoLinkDTO>> ObtenerInvitadosParaEnvioAsync(long idEvento)
        {
            var invitados = await _context.ef_invitados
                .Include(x => x.rsvp_grupo)
                    .ThenInclude(g => g.acceso)
                        .ThenInclude(a => a.acceso_tramos)
                            .ThenInclude(at => at.tramo)
                .Where(x => x.id_evento == idEvento && x.activo && !x.es_staff)
                .ToListAsync();

            // Mapear los tokens de los titulares por grupo para asignarlos a los acompañantes
            var titularTokens = invitados
                .Where(i => i.es_titular_grupo && i.id_rsvp_grupo != null && i.rsvp_token != null)
                .GroupBy(i => i.id_rsvp_grupo!.Value)
                .ToDictionary(g => g.Key, g => g.First().rsvp_token);

            return invitados.Select(x => new InvitadoLinkDTO
            {
                IdInvitado = x.id_invitado,
                Nombre = x.nombre,
                Apellido = x.apellido,
                Email = x.email,
                Celular = x.celular,
                Token = x.rsvp_token ?? (x.id_rsvp_grupo.HasValue && titularTokens.TryGetValue(x.id_rsvp_grupo.Value, out var t) ? t : null),
                RsvpEstado = x.rsvp_estado,
                IdRsvpGrupo = x.id_rsvp_grupo,
                IdAcceso = x.id_acceso,
                Tramos = x.rsvp_grupo?.acceso?.acceso_tramos != null 
                    ? x.rsvp_grupo.acceso.acceso_tramos.Where(at => at.tramo != null).OrderBy(at => at.tramo!.orden).Select(at => new TramoAgendaDTO {
                        IdTramo = at.tramo!.id_tramo,
                        Nombre = at.tramo.nombre,
                        Descripcion = at.tramo.leyenda_visible,
                        Lugar = at.tramo.lugar,
                        Direccion = at.tramo.direccion
                    }).ToList()
                    : new List<TramoAgendaDTO>()
            }).ToList();
        }

        public async Task<string> CrearLinkGenericoAsync(CrearLinkGenericoDTO dto)
        {
            var token = TokenUtility.Generate(64);

            var acceso = await _context.ef_evento_accesos.FindAsync(dto.IdAcceso);
            if (acceso == null) throw new Exception("Acceso no encontrado");

            // Validar límites del plan y estado del evento
            var ev = await _context.ef_eventos.FindAsync(acceso.id_evento);
            if (ev == null) throw new Exception("Evento no encontrado");
            if (ev.estado != "A") throw new Exception("El evento no está activo. No se pueden generar links.");

            var helper = new PlanLimitesHelper(_context);
            await helper.RequireLimiteEnabledAsync(acceso.id_evento, "PERMITIR_GENERAR_LINKS", "Tu plan no permite generar links. Actualizá el plan para enviar invitaciones.");

            var maxLinks = await helper.GetLimiteIntByEventoAsync(acceso.id_evento, "MAX_LINKS_ACCESO");
            if (maxLinks.HasValue && maxLinks.Value > 0)
            {
                var actuales = await _context.ef_evento_acceso_links
                    .CountAsync(x => x.id_evento == acceso.id_evento && x.activo);
                if (actuales >= maxLinks.Value)
                    throw new Exception($"Tu plan permite hasta {maxLinks.Value} links. Actualizá el plan para crear más.");
            }

            var link = new ef_evento_acceso_links
            {
                id_evento = acceso.id_evento,
                id_acceso = dto.IdAcceso,
                titulo = dto.Titulo,
                token = token,
                max_personas_total = dto.MaxPersonasTotal ?? 0,
                max_adultos = dto.MaxAdultos ?? 0,
                requiere_nombres_acompanantes = dto.RequiereNombresAcompanantes, // nuevo
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true
            };

            _context.ef_evento_acceso_links.Add(link);
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<string> GenerarLinkInvitacionAsync(long idUsuario, long idAcceso)
        {
            var acceso = await _context.ef_evento_accesos
                .FirstOrDefaultAsync(x => x.id_acceso == idAcceso);

            if (acceso == null)
                throw new Exception("Acceso inexistente");

            // Validar límites del plan y estado del evento
            var ev = await _context.ef_eventos.FindAsync(acceso.id_evento);
            if (ev == null) throw new Exception("Evento no encontrado");
            if (ev.estado != "A") throw new Exception("El evento no está activo. No se pueden generar links.");

            var helper = new PlanLimitesHelper(_context);
            await helper.RequireLimiteEnabledAsync(acceso.id_evento, "PERMITIR_GENERAR_LINKS", "Tu plan no permite generar links. Actualizá el plan para enviar invitaciones.");

            var maxLinks = await helper.GetLimiteIntByEventoAsync(acceso.id_evento, "MAX_LINKS_ACCESO");
            if (maxLinks.HasValue && maxLinks.Value > 0)
            {
                var actuales = await _context.ef_evento_acceso_links
                    .CountAsync(x => x.id_evento == acceso.id_evento && x.activo);
                if (actuales >= maxLinks.Value)
                    throw new Exception($"Tu plan permite hasta {maxLinks.Value} links. Actualizá el plan para crear más.");
            }

            var token = TokenUtility.Generate(64);

            var link = new ef_evento_acceso_links
            {
                id_evento = acceso.id_evento,
                id_acceso = idAcceso,
                token = token,
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true
            };

            _context.ef_evento_acceso_links.Add(link);

            await _context.SaveChangesAsync();

            return token;
        }
        public async Task<InvitacionEventoDTO?> ObtenerDatosInvitacionAsync(string token)
        {
            var link = await _context.ef_evento_acceso_links
                .FirstOrDefaultAsync(x => x.token == token && x.activo);

            if (link == null)
                return null;

            var acceso = await _context.ef_evento_accesos
                .FirstOrDefaultAsync(a => a.id_acceso == link.id_acceso);

            if (acceso == null)
                return null;

            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(e => e.id_evento == acceso.id_evento);

            if (evento == null)
                return null;

            return new InvitacionEventoDTO
            {
                IdEvento = evento.id_evento,
                IdAcceso = acceso.id_acceso,
                Anfitriones = evento.anfitriones_texto,
                MensajeBienvenida = evento.mensaje_bienvenida,
                DressCode = evento.dress_code_descripcion,
                NombreAcceso = acceso.nombre
            };
        }

        public async Task<InvitacionTitularDTO> ObtenerInvitacionTitularAsync(string token)
        {
            var titular = await _context.ef_invitados
                .FirstOrDefaultAsync(x => x.rsvp_token == token && x.activo);

            if (titular == null)
                throw new Exception("Invitación inválida");

            var grupo = await _context.ef_rsvp_grupos
                .Include(g => g.integrantes)
                    .ThenInclude(i => i.invitado)
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == titular.id_rsvp_grupo);

            if (grupo == null)
                throw new Exception("Grupo inexistente");

            var evento = await _context.ef_eventos.FindAsync(grupo.id_evento);
            if (evento == null)
                throw new Exception("Evento no encontrado");

            // Obtener los accesos del evento con sus tramos
            var accesos = await _context.ef_evento_accesos
                .Where(a => a.id_evento == grupo.id_evento && a.activo)
                .OrderBy(a => a.orden)
                .Select(a => new AccesoAgendaDTO
                {
                    IdAcceso = a.id_acceso,
                    NombreAcceso = a.nombre,
                    Tramos = a.acceso_tramos
                        .Where(at => at.tramo.activo)
                        .OrderBy(at => at.tramo.orden)
                        .Select(at => new TramoAgendaDTO
                        {
                            IdTramo = at.tramo.id_tramo,
                            Nombre = at.tramo.nombre,
                            Descripcion = at.tramo.leyenda_visible,
                            Lugar = at.tramo.lugar,
                            Direccion = at.tramo.direccion
                        }).ToList()
                })
                .ToListAsync();

            // Personas ya cargadas (conocidas)
            var personasConocidas = grupo.integrantes
                .Where(i => i.invitado != null)
                .Select(i => new PersonaExistenteDTO
                {
                    IdInvitado = i.id_invitado,
                    NombreCompleto = $"{i.invitado.nombre} {i.invitado.apellido}",
                    RolEvento = i.rol_evento,
                    Asiste = i.asiste,
                    EsTitular = i.rol == "T"
                })
                .ToList();

            return new InvitacionTitularDTO
            {
                IdEvento = evento.id_evento,
                IdIdioma = evento.id_idioma,
                IdGrupo = grupo.id_rsvp_grupo,
                NombreGrupo = grupo.nombre_grupo,
                Saludo = evento.saludo,
                Anfitriones = evento.anfitriones_texto,
                MensajeBienvenida = evento.mensaje_bienvenida,
                Agenda = accesos,
                Personas = personasConocidas,
                CuposAdultosRestantes = grupo.cant_adultos_sin_nombre ?? 0,
                CuposMenoresRestantes = grupo.cant_menores_sin_nombre ?? 0
            };
        }



        public async Task<string> RegistrarGrupoDesdeLinkAsync(string tokenLink, RegistroLinkRequest request)
        {
            var link = await _context.ef_evento_acceso_links
                .FirstOrDefaultAsync(l => l.token == tokenLink && l.activo);
            if (link == null)
                throw new Exception("Link inválido o inactivo");

            var acceso = await _context.ef_evento_accesos
                .FirstOrDefaultAsync(a => a.id_acceso == link.id_acceso && a.activo);
            if (acceso == null)
                throw new Exception("Acceso no encontrado");

            var evento = await _context.ef_eventos.FindAsync(acceso.id_evento);
            if (evento == null)
                throw new Exception("Evento no encontrado");

            // Validar que el link tenga al menos 1 adulto
            if (link.max_adultos < 1)
                throw new Exception("El link no permite adultos");

            // Calcular cupos totales
            int totalPersonas = 1; // titular
            if (request.Acompanantes != null)
                totalPersonas += request.Acompanantes.Count;

            if (totalPersonas > link.max_personas_total)
                throw new Exception($"El link permite hasta {link.max_personas_total} personas. Has excedido el límite.");

            // Validar cantidad de adultos
            int adultosSolicitados = (request.Titular.RolEvento == "A" ? 1 : 0) +
                                      (request.Acompanantes?.Count(x => x.RolEvento == "A") ?? 0);
            if (adultosSolicitados > link.max_adultos)
                throw new Exception($"El link permite hasta {link.max_adultos} adultos.");

            // Si el link requiere nombres de acompañantes, deben venir todos
            if (link.requiere_nombres_acompanantes && (request.Acompanantes == null || request.Acompanantes.Count == 0))
                throw new Exception("Debes proporcionar los datos de todos los acompañantes.");

            var ahora = DateTimeOffset.UtcNow;

            // Crear grupo con cupos sin nombre = 0 (ya se asignan todos)
            var grupo = new ef_rsvp_grupos
            {
                id_evento = acceso.id_evento,
                id_acceso = acceso.id_acceso,
                id_acceso_link = link.id_acceso_link,
                nombre_grupo = string.IsNullOrWhiteSpace(request.NombreGrupo)
                    ? $"Invitación de {request.Titular.Nombre} {request.Titular.Apellido}"
                    : request.NombreGrupo,
                max_personas_total = link.max_personas_total,
                max_adultos = link.max_adultos,
                cant_adultos_sin_nombre = 0, // ya no hay cupos libres
                cant_menores_sin_nombre = 0,
                cantidad_total = totalPersonas,
                rsvp_estado = "P",
                fecha_alta = ahora,
                activo = true
            };

            _context.ef_rsvp_grupos.Add(grupo);
            await _context.SaveChangesAsync();

            int orden = 1;

            // Crear titular
            var titularInvitado = CrearInvitado(acceso, request.Titular, ahora, grupo.id_rsvp_grupo, true);
            _context.ef_invitados.Add(titularInvitado);
            await _context.SaveChangesAsync();

            _context.ef_rsvp_grupo_integrantes.Add(new ef_rsvp_grupo_integrantes
            {
                id_rsvp_grupo = grupo.id_rsvp_grupo,
                id_invitado = titularInvitado.id_invitado,
                rol = "T",
                orden = orden++,
                rol_evento = request.Titular.RolEvento,
                asiste = "P"
            });

            // Crear acompañantes si existen
            if (request.Acompanantes != null)
            {
                foreach (var acomp in request.Acompanantes)
                {
                    var invitado = CrearInvitado(acceso, acomp, ahora, grupo.id_rsvp_grupo, false);
                    _context.ef_invitados.Add(invitado);
                    await _context.SaveChangesAsync();

                    _context.ef_rsvp_grupo_integrantes.Add(new ef_rsvp_grupo_integrantes
                    {
                        id_rsvp_grupo = grupo.id_rsvp_grupo,
                        id_invitado = invitado.id_invitado,
                        rol = "A",
                        orden = orden++,
                        rol_evento = acomp.RolEvento,
                        asiste = "P"
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Opcional: desactivar el link si es de un solo uso
            link.activo = false;
            await _context.SaveChangesAsync();

            return titularInvitado.rsvp_token;
        }

        private ef_invitados CrearInvitado(ef_evento_accesos acceso, PersonaRegistroDTO data, DateTimeOffset ahora, long idGrupo, bool esTitular)
        {
            return new ef_invitados
            {
                id_evento = acceso.id_evento,
                id_acceso = acceso.id_acceso,
                nombre = data.Nombre,
                apellido = data.Apellido,
                email = data.Email,
                celular = data.Celular,
                activo = true,
                fecha_alta = ahora,
                id_usuario_invitador = null,
                qr_token = TokenUtility.Generate(64),
                rsvp_token = esTitular ? TokenUtility.Generate(64) : null,
                id_rsvp_grupo = idGrupo,
                es_titular_grupo = esTitular,
                rsvp_estado = "P"
            };
        }

        public async Task<InvitadosPersonasResponseDTO> ObtenerPersonasInvitadasAsync(long idEvento)
        {
            var eventoExiste = await _context.ef_eventos
                .AsNoTracking()
                .AnyAsync(x => x.id_evento == idEvento);

            if (!eventoExiste)
                throw new Exception("Evento inexistente.");

            var items = await (
                from i in _context.ef_invitados.AsNoTracking()
                join a in _context.ef_evento_accesos.AsNoTracking()
                    on i.id_acceso equals a.id_acceso into accesoJoin
                from a in accesoJoin.DefaultIfEmpty()
                where i.id_evento == idEvento
                      && i.activo == true
                      && i.es_staff == false
                select new InvitadoPersonaDTO
                {
                    IdInvitado = i.id_invitado,
                    IdEvento = i.id_evento,
                    IdAcceso = i.id_acceso,
                    AccesoNombre = a != null ? a.nombre : null,

                    Nombre = i.nombre,
                    Apellido = i.apellido,
                    NombreCompleto = (i.nombre + " " + i.apellido).Trim(),

                    Email = i.email,
                    Celular = i.celular,

                    RsvpEstado = i.rsvp_estado,
                    FechaRsvp = i.fecha_rsvp,
                    RsvpMensaje = i.rsvp_mensaje,

                    IdRsvpGrupo = i.id_rsvp_grupo,
                    EsTitularGrupo = i.es_titular_grupo,

                    QrToken = i.qr_token,
                    TieneQr = i.qr_token != null && i.qr_token != "",

                    CheckinRealizado = false,
                    FechaCheckin = null,

                    IdMesa = null,
                    MesaNombre = null,

                    TieneRestricciones = false,
                    CantidadSugerenciasMusica = 0
                }
            )
            .OrderBy(x => x.Apellido)
            .ThenBy(x => x.Nombre)
            .ToListAsync();

            var idsInvitados = items.Select(x => x.IdInvitado).ToList();
            var idsGrupos = items
                .Where(x => x.IdRsvpGrupo.HasValue)
                .Select(x => x.IdRsvpGrupo.Value)
                .Distinct()
                .ToList();

            var gruposInfo = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .Where(g =>
                    g.id_evento == idEvento
                    && g.activo == true
                    && idsGrupos.Contains(g.id_rsvp_grupo))
                .Select(g => new
                {
                    g.id_rsvp_grupo,
                    g.nombre_grupo,
                    g.rsvp_mensaje,
                    g.max_adultos,
                    g.cant_adultos_sin_nombre,
                    g.cant_menores_sin_nombre
                })
                .ToListAsync();

            var integrantesGrupoInfo = await _context.ef_rsvp_grupo_integrantes
                .AsNoTracking()
                .Where(x =>
                    idsGrupos.Contains(x.id_rsvp_grupo)
                    && x.id_invitado > 0)
                .Select(x => new
                {
                    x.id_rsvp_grupo,
                    x.id_invitado,
                    x.rol_evento,
                    x.asiste
                })
                .ToListAsync();

            var integrantesGrupoMap = integrantesGrupoInfo
                .GroupBy(x => x.id_rsvp_grupo)
                .ToDictionary(x => x.Key, x => x.ToList());

            var gruposInfoMap = gruposInfo.ToDictionary(x => x.id_rsvp_grupo);

            if (!items.Any())
            {
                return new InvitadosPersonasResponseDTO
                {
                    IdEvento = idEvento,
                    Items = items,
                    Resumen = new InvitadosPersonasResumenDTO()
                };
            }

            // Titular de cada grupo
            var titularesGrupo = await _context.ef_invitados
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento
                    && x.activo == true
                    && x.id_rsvp_grupo.HasValue
                    && idsGrupos.Contains(x.id_rsvp_grupo.Value)
                    && x.es_titular_grupo == true)
                .Select(x => new
                {
                    IdRsvpGrupo = x.id_rsvp_grupo ?? 0,
                    Titular = (x.nombre + " " + x.apellido).Trim()
                })
                .ToListAsync();

            var titularesMap = titularesGrupo
                .GroupBy(x => x.IdRsvpGrupo)
                .ToDictionary(x => x.Key, x => x.First().Titular);

            // Cantidad integrantes por grupo
            var cantidadesGrupo = await _context.ef_invitados
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento
                    && x.activo == true
                    && x.id_rsvp_grupo.HasValue
                    && idsGrupos.Contains(x.id_rsvp_grupo.Value)
                    && x.es_staff == false)
                .GroupBy(x => x.id_rsvp_grupo ?? 0)
                .Select(g => new
                {
                    IdRsvpGrupo = g.Key,
                    Cantidad = g.Count()
                })
                .ToListAsync();

            var cantidadesMap = cantidadesGrupo.ToDictionary(x => x.IdRsvpGrupo, x => x.Cantidad);

            // Check-ins ya realizados
            var checkins = await _context.ef_evento_checkins
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento
                    && idsInvitados.Contains(x.id_invitado)
                    && x.tipo == "INGRESO")
                .GroupBy(x => x.id_invitado)
                .Select(g => new
                {
                    IdInvitado = g.Key,
                    FechaCheckin = g.Max(x => x.fecha)
                })
                .ToListAsync();

            var checkinsMap = checkins.ToDictionary(x => x.IdInvitado, x => x.FechaCheckin);

            // Restricciones alimentarias
            var restricciones = await (
                from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                join r in _context.ef_rsvp_integrante_restricciones.AsNoTracking()
                    on gi.id_rsvp_grupo_integrante equals r.id_rsvp_grupo_integrante
                join pr in _context.ef_param_restricciones_alimentarias.AsNoTracking()
                    on r.id_restriccion_alim equals pr.id_restriccion_alim
                where idsInvitados.Contains(gi.id_invitado)
                select new
                {
                    gi.id_invitado,
                    Texto = pr.codigo,
                    r.observaciones
                }
            ).ToListAsync();

            var restriccionesMap = restricciones
                .GroupBy(x => x.id_invitado)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x =>
                            string.IsNullOrWhiteSpace(x.observaciones)
                                ? x.Texto
                                : x.Texto + " - " + x.observaciones
                        )
                        .Distinct()
                        .ToList()
                );

            // Sugerencias musicales por invitado
            var musica = await _context.ef_invitado_musica_sugerencias
                .AsNoTracking()
                .Where(x => idsInvitados.Contains(x.id_invitado) && x.activo == true)
                .GroupBy(x => x.id_invitado)
                .Select(g => new
                {
                    IdInvitado = g.Key,
                    Cantidad = g.Count()
                })
                .ToListAsync();

            var musicaMap = musica.ToDictionary(x => x.IdInvitado, x => x.Cantidad);

            // Mesas
            var mesas = await (
                from mi in _context.ef_evento_mesa_invitados.AsNoTracking()
                join m in _context.ef_evento_mesas.AsNoTracking()
                    on mi.id_mesa equals m.id_mesa
                where idsInvitados.Contains(mi.id_invitado)
                select new
                {
                    mi.id_invitado,
                    mi.id_mesa,
                    MesaNombre = m.nombre
                }
            ).ToListAsync();

            var mesasMap = mesas
                .GroupBy(x => x.id_invitado)
                .ToDictionary(x => x.Key, x => x.First());

            foreach (var item in items)
            {
                if (item.IdRsvpGrupo.HasValue)
                {
                    var idGrupo = item.IdRsvpGrupo.Value;

                    if (titularesMap.ContainsKey(idGrupo))
                        item.GrupoTitular = titularesMap[idGrupo];

                    if (cantidadesMap.ContainsKey(idGrupo))
                        item.CantidadIntegrantesGrupo = cantidadesMap[idGrupo];

                    if (gruposInfoMap.ContainsKey(idGrupo))
                    {
                        var grupoInfo = gruposInfoMap[idGrupo];

                        item.NombreGrupo = grupoInfo.nombre_grupo;
                        item.RsvpMensajeGrupo = grupoInfo.rsvp_mensaje;

                        if (integrantesGrupoMap.ContainsKey(idGrupo))
                        {
                            var integrantes = integrantesGrupoMap[idGrupo];

                            item.CantidadAdultosConfirmadosGrupo =
                                integrantes.Count(x => x.rol_evento == "A" && x.asiste == "Y");

                            item.CantidadMenoresConfirmadosGrupo =
                                integrantes.Count(x => x.rol_evento == "N" && x.asiste == "Y");

                            item.CantidadAdultosPendientesGrupo =
                                integrantes.Count(x => x.rol_evento == "A" && x.asiste == "P");

                            item.CantidadMenoresPendientesGrupo =
                                integrantes.Count(x => x.rol_evento == "N" && x.asiste == "P");

                            item.CantidadAdultosNoAsistenGrupo =
                                integrantes.Count(x => x.rol_evento == "A" && x.asiste == "N");

                            item.CantidadMenoresNoAsistenGrupo =
                                integrantes.Count(x => x.rol_evento == "N" && x.asiste == "N");

                            var adultosReales = integrantes.Count(x => x.rol_evento == "A");
                            var menoresReales = integrantes.Count(x => x.rol_evento == "N");

                            item.CantidadAdultosInvitadosGrupo =
                                adultosReales + (grupoInfo.cant_adultos_sin_nombre ?? 0);

                            item.CantidadMenoresInvitadosGrupo =
                                menoresReales + (grupoInfo.cant_menores_sin_nombre ?? 0);
                        }
                        else
                        {
                            item.CantidadAdultosInvitadosGrupo = grupoInfo.cant_adultos_sin_nombre ?? 0;
                            item.CantidadMenoresInvitadosGrupo = grupoInfo.cant_menores_sin_nombre ?? 0;
                        }

                        var nombreBase = !string.IsNullOrWhiteSpace(item.NombreGrupo)
                            ? item.NombreGrupo
                            : item.GrupoTitular;

                        var adultosExtra = item.CantidadAdultosInvitadosGrupo;

                        // Restar al titular (normalmente adulto) del conteo de "extras"
                        if (adultosExtra > 0)
                            adultosExtra--;

                        var partes = new List<string>();

                        if (adultosExtra > 0)
                            partes.Add(adultosExtra == 1 ? "+1 adulto" : "+" + adultosExtra + " adultos");

                        if (item.CantidadMenoresInvitadosGrupo > 0)
                            partes.Add(item.CantidadMenoresInvitadosGrupo == 1 ? "+1 menor" : "+" + item.CantidadMenoresInvitadosGrupo + " menores");

                        item.GrupoResumenTexto = partes.Any()
                            ? nombreBase + " (titular " + string.Join(" ", partes) + ")"
                            : nombreBase;
                    }
                }

                if (checkinsMap.ContainsKey(item.IdInvitado))
                {
                    item.CheckinRealizado = true;
                    item.FechaCheckin = checkinsMap[item.IdInvitado];
                }

                if (restriccionesMap.ContainsKey(item.IdInvitado))
                {
                    item.Restricciones = restriccionesMap[item.IdInvitado];
                    item.TieneRestricciones = item.Restricciones.Any();
                }

                if (musicaMap.ContainsKey(item.IdInvitado))
                    item.CantidadSugerenciasMusica = musicaMap[item.IdInvitado];

                if (mesasMap.ContainsKey(item.IdInvitado))
                {
                    item.IdMesa = mesasMap[item.IdInvitado].id_mesa;
                    item.MesaNombre = mesasMap[item.IdInvitado].MesaNombre;
                }
            }

            var gruposResumen = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .Where(g =>
                    g.id_evento == idEvento
                    && g.activo == true)
                .Select(g => new
                {
                    g.id_rsvp_grupo,
                    g.max_personas_total
                })
                .ToListAsync();

            var totalGrupos = gruposResumen.Count;

            var cuposInvitados = gruposResumen.Sum(x => x.max_personas_total);

            var personasCargadas = items.Count;
            var confirmados = items.Count(x => x.RsvpEstado == "Y");
            var pendientes = items.Count(x => x.RsvpEstado == "P");
            var noAsisten = items.Count(x => x.RsvpEstado == "N");

            var cuposNoUsados = cuposInvitados - personasCargadas;

            if (cuposNoUsados < 0)
                cuposNoUsados = 0;

            items = items
                .OrderBy(x => x.NombreGrupo ?? x.GrupoTitular ?? x.NombreCompleto)
                .ThenByDescending(x => x.EsTitularGrupo)
                .ThenBy(x => x.Apellido)
                .ThenBy(x => x.Nombre)
                .ToList();
             
            var resumen = new InvitadosPersonasResumenDTO
            {
                TotalGrupos = totalGrupos,
                CuposInvitados = cuposInvitados,
                PersonasCargadas = personasCargadas,

                Confirmados = confirmados,
                Pendientes = pendientes,
                NoAsisten = noAsisten,

                CuposNoUsados = cuposNoUsados,

                Ingresaron = items.Count(x => x.CheckinRealizado),
                ConRestricciones = items.Count(x => x.TieneRestricciones)
            };

            return new InvitadosPersonasResponseDTO
            {
                IdEvento = idEvento,
                Resumen = resumen,
                Items = items
            };
        }

        public async Task<InvitadosGruposResponseDTO> ObtenerGruposInvitadosAsync(long idEvento)
        {
            var gruposBase = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .Where(g =>
                    g.id_evento == idEvento
                    && g.activo == true)
                .Select(g => new
                {
                    g.id_rsvp_grupo,
                    g.nombre_grupo,
                    g.rsvp_mensaje,
                    g.cant_adultos_sin_nombre,
                    g.cant_menores_sin_nombre
                })
                .ToListAsync();

            var invitados = await _context.ef_invitados
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento
                    && x.activo == true
                    && x.id_rsvp_grupo.HasValue
                    && x.es_staff == false)
                .ToListAsync();

            var checkins = await _context.ef_evento_checkins
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento
                    && x.tipo == "INGRESO")
                .ToListAsync();

            // Info del integrante RSVP (adulto / menor + asiste)
            var integrantesInfo = await _context.ef_rsvp_grupo_integrantes
                .AsNoTracking()
                .Where(x =>
                    x.id_rsvp_grupo > 0
                    && x.id_invitado > 0)
                .Select(x => new
                {
                    x.id_rsvp_grupo,
                    x.id_invitado,
                    x.rol_evento,
                    x.asiste
                })
                .ToListAsync();

            var integrantesInfoMap = integrantesInfo
                .GroupBy(x => x.id_invitado)
                .ToDictionary(x => x.Key, x => x.First());

            var grupos = gruposBase
                .Select(gb =>
                {
                    var integrantesGrupo = invitados
                        .Where(x => x.id_rsvp_grupo == gb.id_rsvp_grupo)
                        .ToList();

                    var titular = integrantesGrupo
                        .FirstOrDefault(x => x.es_titular_grupo);

                    // --------------------------
                    // Adultos / menores invitados
                    // --------------------------

                    var adultosReales = integrantesInfo
                        .Count(x =>
                            x.id_rsvp_grupo == gb.id_rsvp_grupo
                            && x.rol_evento == "A");

                    var menoresReales = integrantesInfo
                        .Count(x =>
                            x.id_rsvp_grupo == gb.id_rsvp_grupo
                            && x.rol_evento == "N");

                    var adultosInvitados =
                        adultosReales +
                        (gb.cant_adultos_sin_nombre ?? 0);

                    var menoresInvitados =
                        menoresReales +
                        (gb.cant_menores_sin_nombre ?? 0);

                    // --------------------------
                    // Confirmados
                    // --------------------------

                    var adultosConfirmados = integrantesInfo
                        .Count(x =>
                            x.id_rsvp_grupo == gb.id_rsvp_grupo
                            && x.rol_evento == "A"
                            && x.asiste == "Y");

                    var menoresConfirmados = integrantesInfo
                        .Count(x =>
                            x.id_rsvp_grupo == gb.id_rsvp_grupo
                            && x.rol_evento == "N"
                            && x.asiste == "Y");

                    // --------------------------
                    // Texto resumen grupo
                    // Ej:
                    // Familia Anton (+1 adulto +2 menores)
                    // --------------------------

                    var nombreBase =
                        !string.IsNullOrWhiteSpace(gb.nombre_grupo)
                            ? gb.nombre_grupo
                            : titular != null
                                ? (titular.nombre + " " + titular.apellido).Trim()
                                : "Sin grupo";

                    var adultosExtra = adultosInvitados;

                    // el titular normalmente es adulto
                    if (adultosExtra > 0)
                        adultosExtra--;

                    var partes = new List<string>();

                    if (adultosExtra > 0)
                    {
                        partes.Add(
                            adultosExtra == 1
                                ? "+1 adulto"
                                : "+" + adultosExtra + " adultos");
                    }

                    if (menoresInvitados > 0)
                    {
                        partes.Add(
                            menoresInvitados == 1
                                ? "+1 menor"
                                : "+" + menoresInvitados + " menores");
                    }

                    var grupoResumenTexto =
                        partes.Any()
                            ? nombreBase + " (titular " + string.Join(" ", partes) + ")"
                            : nombreBase;

                    // --------------------------
                    // Integrantes
                    // --------------------------

                    var integrantes = integrantesGrupo
                        .Select(i =>
                        {
                            var info =
                                integrantesInfoMap.ContainsKey(i.id_invitado)
                                    ? integrantesInfoMap[i.id_invitado]
                                    : null;

                            return new InvitadoGrupoIntegranteDTO
                            {
                                IdInvitado = i.id_invitado,
                                NombreCompleto = (i.nombre + " " + i.apellido).Trim(),

                                EsTitularGrupo = i.es_titular_grupo,

                                RolEvento = info != null
                                    ? info.rol_evento
                                    : null,

                                RsvpEstado = i.rsvp_estado,
                                RsvpMensaje = i.rsvp_mensaje,

                                CheckinRealizado =
                                    checkins.Any(c =>
                                        c.id_invitado == i.id_invitado)
                            };
                        })
                        .OrderByDescending(x => x.EsTitularGrupo)
                        .ThenBy(x => x.NombreCompleto)
                        .ToList();

                    // --------------------------
                    // Estado grupo
                    // --------------------------

                    var confirmados =
                        integrantesGrupo.Count(x => x.rsvp_estado == "Y");

                    var pendientes =
                        integrantesGrupo.Count(x => x.rsvp_estado == "P");

                    var rechazados =
                        integrantesGrupo.Count(x => x.rsvp_estado == "N");

                    string estadoGrupo = "PENDIENTE";

                    if (integrantesGrupo.Count > 0
                        && confirmados == integrantesGrupo.Count)
                    {
                        estadoGrupo = "CONFIRMADO";
                    }
                    else if (integrantesGrupo.Count > 0
                             && rechazados == integrantesGrupo.Count)
                    {
                        estadoGrupo = "RECHAZADO";
                    }
                    else if (confirmados > 0)
                    {
                        estadoGrupo = "PARCIAL";
                    }

                    return new InvitadoGrupoDTO
                    {
                        IdRsvpGrupo = gb.id_rsvp_grupo,

                        NombreGrupo = gb.nombre_grupo,
                        GrupoResumenTexto = grupoResumenTexto,

                        Titular = titular != null
                            ? (titular.nombre + " " + titular.apellido).Trim()
                            : "Sin titular",

                        EmailTitular = titular?.email,
                        CelularTitular = titular?.celular,

                        RsvpMensaje = titular?.rsvp_mensaje,
                        RsvpMensajeGrupo = gb.rsvp_mensaje,

                        CantidadIntegrantes = integrantesGrupo.Count,

                        CantidadAdultosInvitadosGrupo = adultosInvitados,
                        CantidadMenoresInvitadosGrupo = menoresInvitados,

                        CantidadAdultosConfirmadosGrupo = adultosConfirmados,
                        CantidadMenoresConfirmadosGrupo = menoresConfirmados,

                        Confirmados = confirmados,
                        Pendientes = pendientes,
                        Rechazados = rechazados,

                        RsvpEstadoGrupo = estadoGrupo,

                        Integrantes = integrantes
                    };
                })
                .OrderBy(x => x.NombreGrupo ?? x.Titular)
                .ToList();

            return new InvitadosGruposResponseDTO
            {
                IdEvento = idEvento,
                Items = grupos
            };
        }

        public async Task<ResumenRsvpDTO> ObtenerResumenRsvpAsync(string token)
        {
            token = token?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Token inválido.");

            var titular = await _context.ef_invitados
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.rsvp_token != null
                    && x.rsvp_token.ToLower() == token.ToLower()
                    && x.activo == true);

            if (titular == null)
                throw new Exception("Invitación no encontrada.");

            if (titular.id_rsvp_grupo == null)
                throw new Exception("La invitación no pertenece a un grupo RSVP.");

            var grupo = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.id_rsvp_grupo == titular.id_rsvp_grupo.Value);

            if (grupo == null)
                throw new Exception("Grupo RSVP inexistente.");

            var evento = await _context.ef_eventos
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.id_evento == titular.id_evento);

            // ------------------------------------------
            // Integrantes ya cargados
            // ------------------------------------------

            var integrantes = await (
                from inv in _context.ef_invitados.AsNoTracking()
                join gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    on inv.id_invitado equals gi.id_invitado into gj
                from gi in gj.DefaultIfEmpty()
                where inv.id_evento == titular.id_evento
                      && inv.id_rsvp_grupo == titular.id_rsvp_grupo
                      && inv.activo == true
                      && inv.es_staff == false
                select new ResumenRsvpIntegranteDTO
                {
                    IdInvitado = inv.id_invitado,
                    NombreCompleto =
                        (inv.nombre + " " + inv.apellido).Trim(),

                    EsTitularGrupo = inv.es_titular_grupo,

                    RolEvento = gi != null
                        ? gi.rol_evento
                        : null,

                    RsvpEstado = inv.rsvp_estado,
                    QrToken = inv.qr_token,
                    RsvpMensaje = inv.rsvp_mensaje,
                    FechaRsvp = inv.fecha_rsvp
                })
                .OrderByDescending(x => x.EsTitularGrupo)
                .ThenBy(x => x.NombreCompleto)
                .ToListAsync();

            var idsInvitados =
                integrantes.Select(x => x.IdInvitado).ToList();

            // ------------------------------------------
            // Conteos grupo
            // ------------------------------------------

            var adultosCargados =
                integrantes.Count(x => x.RolEvento == "A");

            var menoresCargados =
                integrantes.Count(x => x.RolEvento == "N");

            var adultosInvitados =
                1 + (grupo.cant_adultos_sin_nombre ?? 0);

            var menoresInvitados =
                grupo.cant_menores_sin_nombre ?? 0;

            var cuposInvitados =
                adultosInvitados + menoresInvitados;

            var personasCargadas =
                integrantes.Count;

            var cuposSinDefinir =
                Math.Max(0, cuposInvitados - personasCargadas);

            var adultosDisponibles =
                Math.Max(0, adultosInvitados - adultosCargados);

            var menoresDisponibles =
                Math.Max(0, menoresInvitados - menoresCargados);

            var confirmados =
                integrantes.Count(x => x.RsvpEstado == "Y");

            var pendientes =
                integrantes.Count(x => x.RsvpEstado == "P");

            var rechazados =
                integrantes.Count(x => x.RsvpEstado == "N");

            // ------------------------------------------
            // Estado grupo
            // ------------------------------------------

            string estadoGrupo = "PENDIENTE";

            if (rechazados > 0
                && rechazados == integrantes.Count
                && grupo.grupo_cerrado)
            {
                estadoGrupo = "RECHAZADO";
            }
            else if (cuposSinDefinir > 0
                     && confirmados > 0)
            {
                estadoGrupo = "INCOMPLETO";
            }
            else if (confirmados == integrantes.Count
                     && grupo.grupo_cerrado)
            {
                estadoGrupo = "CONFIRMADO";
            }
            else if (confirmados > 0)
            {
                estadoGrupo = "PARCIAL";
            }

            // ------------------------------------------
            // Mesas
            // ------------------------------------------

            var mesas = await (
                from mi in _context.ef_evento_mesa_invitados.AsNoTracking()
                join m in _context.ef_evento_mesas.AsNoTracking()
                    on mi.id_mesa equals m.id_mesa
                where idsInvitados.Contains(mi.id_invitado)
                select new
                {
                    mi.id_invitado,
                    mi.id_mesa,
                    MesaNombre = m.nombre
                }
            ).ToListAsync();

            var mesasMap = mesas
                .GroupBy(x => x.id_invitado)
                .ToDictionary(x => x.Key, x => x.First());

            // ------------------------------------------
            // Restricciones
            // ------------------------------------------

            var restricciones = await (
                from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                join r in _context.ef_rsvp_integrante_restricciones.AsNoTracking()
                    on gi.id_rsvp_grupo_integrante
                    equals r.id_rsvp_grupo_integrante
                join pr in _context.ef_param_restricciones_alimentarias.AsNoTracking()
                    on r.id_restriccion_alim
                    equals pr.id_restriccion_alim
                where idsInvitados.Contains(gi.id_invitado)
                select new
                {
                    gi.id_invitado,
                    Texto = pr.codigo,
                    r.observaciones
                }
            ).ToListAsync();

            var restriccionesMap = restricciones
                .GroupBy(x => x.id_invitado)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x =>
                        string.IsNullOrWhiteSpace(x.observaciones)
                            ? x.Texto
                            : x.Texto + " - " + x.observaciones
                    ).Distinct().ToList()
                );

            // ------------------------------------------
            // Música
            // ------------------------------------------

            var sugerencias = await _context
                .ef_invitado_musica_sugerencias
                .AsNoTracking()
                .Where(x =>
                    idsInvitados.Contains(x.id_invitado)
                    && x.activo == true)
                .Select(x => new
                {
                    x.id_invitado,
                    Texto =
                        ((x.titulo ?? "") +
                         (string.IsNullOrWhiteSpace(x.artista)
                            ? ""
                            : " - " + x.artista)).Trim()
                })
                .ToListAsync();

            var sugerenciasMap = sugerencias
                .GroupBy(x => x.id_invitado)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.Texto).ToList()
                );

            foreach (var item in integrantes)
            {
                if (mesasMap.ContainsKey(item.IdInvitado))
                {
                    item.IdMesa =
                        mesasMap[item.IdInvitado].id_mesa;

                    item.MesaNombre =
                        mesasMap[item.IdInvitado].MesaNombre;
                }

                if (restriccionesMap.ContainsKey(item.IdInvitado))
                {
                    item.Restricciones =
                        restriccionesMap[item.IdInvitado];

                    item.TieneRestricciones =
                        item.Restricciones.Any();
                }

                if (sugerenciasMap.ContainsKey(item.IdInvitado))
                {
                    item.SugerenciasMusica =
                        sugerenciasMap[item.IdInvitado];

                    item.CantidadSugerenciasMusica =
                        item.SugerenciasMusica.Count;
                }
            }

            return new ResumenRsvpDTO
            {
                IdEvento = titular.id_evento,

                Evento = evento?.saludo,

                IdRsvpGrupo =
                    titular.id_rsvp_grupo.Value,

                Titular =
                    (titular.nombre + " " + titular.apellido).Trim(),

                RsvpEstadoGrupo = estadoGrupo,

                RsvpMensaje = grupo.rsvp_mensaje,

                GrupoCerrado =
                    grupo.grupo_cerrado,

                PuedeEditarGrupo =
                    !grupo.grupo_cerrado
                    && cuposSinDefinir > 0,

                CuposInvitados =
                    cuposInvitados,

                PersonasCargadas =
                    personasCargadas,

                CuposSinDefinir =
                    cuposSinDefinir,

                AdultosInvitados =
                    adultosInvitados,

                MenoresInvitados =
                    menoresInvitados,

                AdultosCargados =
                    adultosCargados,

                MenoresCargados =
                    menoresCargados,

                AdultosDisponibles =
                    adultosDisponibles,

                MenoresDisponibles =
                    menoresDisponibles,

                Integrantes = integrantes
            };
        }





    }
}
