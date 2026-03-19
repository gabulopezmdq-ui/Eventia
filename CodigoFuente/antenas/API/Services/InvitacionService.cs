using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using API.Utility;
using System.Linq;

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
            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Token de invitación inválido (vacío)");

            // Buscar al titular a través del token
            var titular = await _context.ef_invitados
                .FirstOrDefaultAsync(x => x.rsvp_token == token && x.activo);

            if (titular == null)
                throw new Exception("Invitación no encontrada o token inválido");

            if (titular.id_rsvp_grupo == null)
                throw new Exception("El invitado no pertenece a ningún grupo RSVP");

            var grupo = await _context.ef_rsvp_grupos
                .Include(g => g.integrantes)
                    .ThenInclude(i => i.invitado)
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == titular.id_rsvp_grupo);


            if (grupo == null)
                throw new Exception("Grupo inexistente");

            var ahora = DateTimeOffset.UtcNow;

            // 1. Procesar cada persona enviada en la confirmación
            foreach (var persona in datos.Personas)
            {
                // Buscar si ya existe como integrante (por IdInvitado)
                var integranteExistente = grupo.integrantes
                    .FirstOrDefault(i => i.id_invitado == persona.IdInvitado);

                if (integranteExistente != null)
                {
                    // Actualizar persona conocida
                    integranteExistente.asiste = persona.Asiste ? "Y" : "N";
                    integranteExistente.fecha_respuesta = ahora;

                    // Actualizar datos del invitado (email, celular, mensaje personal)
                    var invitado = integranteExistente.invitado;
                    invitado.email = persona.Email ?? invitado.email;
                    invitado.celular = persona.Celular ?? invitado.celular;
                    invitado.rsvp_estado = integranteExistente.asiste;
                    invitado.rsvp_mensaje = persona.Mensaje;
                    invitado.fecha_rsvp = ahora;
                    invitado.fecha_modif = ahora;

                    // Actualizar edad y alimentación si vienen
                    integranteExistente.edad_anios = (short?)(persona.Edad ?? integranteExistente.edad_anios);
                    integranteExistente.alimentacion_detalle = persona.AlimentacionDetalle ?? integranteExistente.alimentacion_detalle;

                    // Procesar restricciones (chips seleccionados)
                    if (persona.IdsRestricciones != null)
                    {
                        await GuardarRestriccionesManualAsync(integranteExistente.id_rsvp_grupo_integrante, persona.IdsRestricciones);
                    }
                }
                else
                {
                    // Es una persona nueva (se está agregando ahora)
                    // Verificar cupos disponibles según el rol
                    if (persona.RolEvento == "A")
                    {
                        if ((grupo.cant_adultos_sin_nombre ?? 0) <= 0)
                            throw new Exception("No hay cupos disponibles para adultos adicionales");
                        grupo.cant_adultos_sin_nombre = (grupo.cant_adultos_sin_nombre ?? 0) - 1;
                    }
                    else if (persona.RolEvento == "N")
                    {
                        if ((grupo.cant_menores_sin_nombre ?? 0) <= 0)
                            throw new Exception("No hay cupos disponibles para menores adicionales");
                        grupo.cant_menores_sin_nombre = (grupo.cant_menores_sin_nombre ?? 0) - 1;
                    }
                    else
                    {
                        throw new Exception("Rol de evento inválido");
                    }

                    // Crear nuevo invitado
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
                    await _context.SaveChangesAsync(); // Para obtener el ID generado

                    // Crear nuevo integrante
                    var nuevoIntegrante = new ef_rsvp_grupo_integrantes
                    {
                        id_rsvp_grupo = grupo.id_rsvp_grupo,
                        id_invitado = nuevoInvitado.id_invitado,
                        rol = "A", // acompañante (no titular)
                        orden = grupo.integrantes.Count + 1,
                        rol_evento = persona.RolEvento,
                        asiste = persona.Asiste ? "Y" : "N",
                        edad_anios = (short?)persona.Edad,
                        alimentacion_detalle = persona.AlimentacionDetalle,
                        fecha_respuesta = ahora
                    };

                    _context.ef_rsvp_grupo_integrantes.Add(nuevoIntegrante);
                    await _context.SaveChangesAsync(); // Para tener el id_rsvp_grupo_integrante

                    // Procesar restricciones (chips seleccionados)
                    if (persona.IdsRestricciones != null)
                    {
                        await GuardarRestriccionesManualAsync(nuevoIntegrante.id_rsvp_grupo_integrante, persona.IdsRestricciones);
                    }
                    
                    // IMPORTANTE: agregar a la colección para que el cálculo de estados lo tome en cuenta
                    grupo.integrantes.Add(nuevoIntegrante);
                }
            }

            // 2. Determinar el estado final del grupo
            var estados = grupo.integrantes.Select(x => x.asiste).ToList();
            if (estados.All(x => x == "Y"))
                grupo.rsvp_estado = "Y";
            else if (estados.All(x => x == "N"))
                grupo.rsvp_estado = "N";
            else
                grupo.rsvp_estado = "Y"; // Mixto, consideramos confirmado (o podrías usar "P" si prefieres)

            grupo.rsvp_mensaje = datos.MensajeGrupo;
            grupo.fecha_rsvp = ahora;
            grupo.fecha_modif = ahora;

            await _context.SaveChangesAsync();
        }

        private async Task GuardarRestriccionesManualAsync(long idIntegrante, List<long> idsRestricciones)
        {
            // Borramos existentes y re-insertamos
            var existentes = await _context.ef_rsvp_integrante_restricciones
                .Where(x => x.id_rsvp_grupo_integrante == idIntegrante)
                .ToListAsync();

            if (existentes.Any())
                _context.ef_rsvp_integrante_restricciones.RemoveRange(existentes);

            foreach (var idR in idsRestricciones)
            {
                _context.ef_rsvp_integrante_restricciones.Add(new ef_rsvp_integrante_restricciones
                {
                    id_rsvp_grupo_integrante = idIntegrante,
                    id_restriccion_alim = idR,
                    fecha_alta = DateTime.UtcNow
                });
            }
        }

        public async Task CargarInvitadosAsync(CrearGrupoInvitacionRequest req, long idUsuario)
        {
            var evento = await _context.ef_eventos.FindAsync(req.IdEvento);

            if (evento == null)
                throw new Exception("Evento inexistente");

            var ahora = DateTimeOffset.UtcNow;

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
        }
        public async Task<List<InvitadoLinkDTO>> ObtenerInvitadosParaEnvioAsync(long idEvento)
        {
            return await _context.ef_invitados
                .Where(x => x.id_evento == idEvento && x.activo && x.es_titular_grupo) // solo titulares
                .Select(x => new InvitadoLinkDTO
                {
                    IdInvitado = x.id_invitado,
                    Nombre = x.nombre,
                    Apellido = x.apellido,
                    Email = x.email,
                    Celular = x.celular,
                    Token = x.rsvp_token // se asume que no es null, pero si lo fuera, el DTO debería ser nullable
                })
                .ToListAsync();
        }

        public async Task<string> CrearLinkGenericoAsync(CrearLinkGenericoDTO dto)
        {
            var token = TokenUtility.Generate(64);

            var acceso = await _context.ef_evento_accesos.FindAsync(dto.IdAcceso);
            if (acceso == null) throw new Exception("Acceso no encontrado");

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
                    NombreAcceso = a.nombre,
                    Tramos = a.acceso_tramos
                        .Where(at => at.tramo.activo)
                        .OrderBy(at => at.tramo.orden)
                        .Select(at => new TramoAgendaDTO
                        {
                            Nombre = at.tramo.nombre,
                            Descripcion = at.tramo.leyenda_visible,
                            Lugar = at.tramo.lugar,
                            Direccion = at.tramo.direccion,
                            Orden = at.tramo.orden
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
                    Asiste = i.asiste
                })
                .ToList();

            return new InvitacionTitularDTO
            {
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
    }
}
