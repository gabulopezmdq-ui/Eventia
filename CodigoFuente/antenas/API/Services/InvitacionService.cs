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

        public async Task ConfirmarAsync(string token, List<RsvpPersonaConfirmacionDTO> datos)
        {
            var titular = await _context.ef_invitados
                .Include(x => x.id_rsvp_grupo)
                .FirstOrDefaultAsync(x => x.rsvp_token == token && x.activo);

            if (titular == null)
                throw new Exception("Invitación inválida");

            var grupo = await _context.ef_rsvp_grupos
                .Include(g => g.integrantes)
                    .ThenInclude(i => i.invitado)
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == titular.id_rsvp_grupo);

            if (grupo == null)
                throw new Exception("Grupo inexistente");

            var ahora = DateTimeOffset.UtcNow;

            foreach (var persona in datos)
            {
                ef_rsvp_grupo_integrantes integrante = null;

                if (persona.IdInvitado != null)
                {
                    integrante = grupo.integrantes
                        .FirstOrDefault(x => x.id_invitado == persona.IdInvitado);
                }

                if (integrante != null)
                {
                    integrante.asiste = persona.Asiste ? "Y" : "N";
                    integrante.fecha_respuesta = ahora;

                    integrante.invitado.rsvp_estado = integrante.asiste;
                    integrante.invitado.rsvp_mensaje = persona.Mensaje;
                    integrante.invitado.fecha_rsvp = ahora;
                    integrante.invitado.fecha_modif = ahora;
                }
                else
                {
                    if (grupo.integrantes.Count >= grupo.max_personas_total)
                        throw new Exception("Se superó la cantidad máxima de invitados del grupo");

                    var nuevoInvitado = new ef_invitados
                    {
                        id_evento = titular.id_evento,
                        id_acceso = titular.id_acceso,
                        nombre = persona.Nombre,
                        apellido = persona.Apellido,
                        sobrenombre = null,
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

                    var nuevoIntegrante = new ef_rsvp_grupo_integrantes
                    {
                        id_rsvp_grupo = grupo.id_rsvp_grupo,
                        invitado = nuevoInvitado,
                        rol = "A",
                        orden = grupo.integrantes.Count + 1,
                        rol_evento = persona.RolEvento,
                        asiste = persona.Asiste ? "Y" : "N",
                        fecha_respuesta = ahora
                    };

                    grupo.integrantes.Add(nuevoIntegrante);
                }
            }

            var todos = grupo.integrantes.Select(x => x.asiste).ToList();

            if (todos.All(x => x == "Y"))
                grupo.rsvp_estado = "Y";
            else if (todos.All(x => x == "N"))
                grupo.rsvp_estado = "N";
            else
                grupo.rsvp_estado = "Y";

            grupo.rsvp_mensaje = datos.FirstOrDefault()?.MensajeGrupo;
            grupo.fecha_rsvp = ahora;
            grupo.fecha_modif = ahora;

            await _context.SaveChangesAsync();
        }

        public async Task CargarInvitadosAsync(CrearGrupoInvitacionRequest req, long idUsuario)
        {
            var evento = await _context.ef_eventos.FindAsync(req.IdEvento);

            if (evento == null)
                throw new Exception("Evento inexistente");

            var grupo = new ef_rsvp_grupos
            {
                id_evento = req.IdEvento,
                id_acceso = req.IdAcceso,
                nombre_grupo = req.NombreGrupo,
                max_personas_total = req.MaxPersonasTotal,
                max_adultos = req.Personas.Count(x => x.RolEvento == "A"),
                cantidad_total = req.MaxPersonasTotal,
                rsvp_estado = "P",
                fecha_alta = DateTimeOffset.UtcNow,
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
                    rsvp_token = TokenUtility.Generate(64),
                    qr_token = TokenUtility.Generate(64),
                    fecha_alta = DateTimeOffset.UtcNow,
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
                .Where(x => x.id_evento == idEvento && x.activo)
                .Select(x => new InvitadoLinkDTO
                {
                    IdInvitado = x.id_invitado,
                    Nombre = x.nombre,
                    Apellido = x.apellido,
                    Email = x.email,
                    Celular = x.celular,
                    Token = x.rsvp_token
                })
                .ToListAsync();
        }

        public async Task<string> CrearLinkGenericoAsync(CrearLinkGenericoDTO dto)
        {
            var token = TokenUtility.Generate(64);

            var link = new ef_evento_acceso_links
            {
                id_acceso = dto.IdAcceso,
                titulo = dto.Titulo,
                token = token,
                max_personas_total = dto.MaxPersonasTotal ?? 0,
                max_adultos = dto.MaxAdultos ?? 0,
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
    }
}
