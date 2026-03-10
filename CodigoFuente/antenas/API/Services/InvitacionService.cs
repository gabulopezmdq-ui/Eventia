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

        public async Task ConfirmarAsync(string token, RsvpConfirmacionDTO dto)
        {
            // 1. Buscar primero como invitado precargado (rsvp_token)
            var invitadoPrecargado = await _context.ef_invitados
                .FirstOrDefaultAsync(i => i.rsvp_token == token && i.activo);

            // 2. Si no, buscar como link de acceso genérico
            var accesoLink = await _context.ef_evento_acceso_links
                .Include(x => x.acceso)
                .FirstOrDefaultAsync(x => x.token == token && x.activo);

            if (invitadoPrecargado == null && accesoLink == null)
                throw new Exception("Link inválido o inactivo.");

            // 3. Determinar el evento y el responsable
            long idEvento;
            ef_invitados responsable;

            if (invitadoPrecargado != null)
            {
                // Caso invitado precargado
                idEvento = invitadoPrecargado.id_evento;
                responsable = invitadoPrecargado;

                if (responsable.rsvp_estado != "P")
                    throw new Exception("Este invitado ya ha confirmado previamente.");
            }
            else
            {
                // Caso link genérico
                idEvento = accesoLink.acceso.id_evento;

                responsable = new ef_invitados
                {
                    id_evento = idEvento,
                    nombre = dto.Nombre.Trim(),
                    apellido = dto.Apellido.Trim(),
                    email = dto.Email,
                    celular = PhoneUtilHelper.NormalizeE164(dto.Celular, "AR"),
                    rsvp_estado = dto.Asiste ? "Y" : "N",
                    fecha_rsvp = DateTimeOffset.UtcNow,
                    fecha_alta = DateTimeOffset.UtcNow,
                    activo = true,
                    rsvp_token = TokenUtility.Generate(64),
                    qr_token = TokenUtility.Generate(64),
                    id_acceso = accesoLink.id_acceso
                };

                _context.ef_invitados.Add(responsable);
            }

            // 4. Obtener evento
            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(e => e.id_evento == idEvento);

            if (evento == null)
                throw new Exception("Evento no encontrado.");

            // 5. Determinar acceso y link
            long idAcceso;
            long idAccesoLink;
            int? maxPersonasTotal = null;
            int? maxAdultos = null;

            if (accesoLink != null)
            {
                idAcceso = accesoLink.id_acceso;
                idAccesoLink = accesoLink.id_acceso_link;
                maxPersonasTotal = accesoLink.max_personas_total;
                maxAdultos = accesoLink.max_adultos;
            }
            else
            {
                if (responsable.id_acceso.HasValue)
                {
                    idAcceso = responsable.id_acceso.Value;
                }
                else if (evento.id_acceso_default.HasValue)
                {
                    idAcceso = evento.id_acceso_default.Value;
                }
                else
                {
                    var accesoDefault = await _context.ef_evento_accesos
                        .Where(a => a.id_evento == idEvento && a.activo)
                        .OrderBy(a => a.orden)
                        .FirstOrDefaultAsync();

                    if (accesoDefault == null)
                        throw new Exception("El evento no tiene accesos configurados.");

                    idAcceso = accesoDefault.id_acceso;
                }

                var linkDefault = await _context.ef_evento_acceso_links
                    .Where(l => l.id_acceso == idAcceso && l.activo)
                    .OrderBy(l => l.fecha_alta)
                    .FirstOrDefaultAsync();

                if (linkDefault == null)
                    throw new Exception("No hay link de acceso activo para el acceso seleccionado.");

                idAccesoLink = linkDefault.id_acceso_link;
                maxPersonasTotal = linkDefault.max_personas_total;
                maxAdultos = linkDefault.max_adultos;
            }

            // 6. Calcular cantidad total
            int total = 1 + (dto.Acompanantes?.Count ?? 0);

            // 7. Crear grupo
            var grupo = new ef_rsvp_grupos
            {
                id_evento = idEvento,
                id_acceso = idAcceso,
                id_acceso_link = idAccesoLink,
                max_personas_total = maxPersonasTotal ?? 100,
                max_adultos = maxAdultos,
                cantidad_total = total,
                rsvp_estado = dto.Asiste ? "Y" : "N",
                rsvp_mensaje = dto.Mensaje,
                fecha_rsvp = DateTimeOffset.UtcNow,
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true
            };

            // 8. Responsable del grupo
            grupo.integrantes.Add(new ef_rsvp_grupo_integrantes
            {
                invitado = responsable,
                rol = "T",
                rol_evento = "R",
                orden = 1
            });

            // 9. Acompañantes
            int orden = 2;

            if (dto.Acompanantes != null && dto.Acompanantes.Any())
            {
                foreach (var a in dto.Acompanantes)
                {
                    var invitadoAcompanante = new ef_invitados
                    {
                        id_evento = idEvento,
                        nombre = a.Nombre,
                        apellido = a.Apellido,
                        fecha_alta = DateTimeOffset.UtcNow,
                        activo = true
                    };

                    grupo.integrantes.Add(new ef_rsvp_grupo_integrantes
                    {
                        invitado = invitadoAcompanante,
                        rol = "A",
                        orden = orden++,
                        edad_anios = a.EdadAnios,
                        id_evento_edad_rango = a.IdEventoEdadRango
                    });
                }
            }

            // 10. Guardar grupo
            _context.ef_rsvp_grupos.Add(grupo);

            // actualizar estado del responsable
            responsable.rsvp_estado = dto.Asiste ? "Y" : "N";
            responsable.fecha_rsvp = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            // 11. Guardar restricciones
            if (dto.Restricciones != null && dto.Restricciones.Any())
            {
                var restrDto = new RestriccionesGrupoUpsertDTO
                {
                    Integrantes = dto.Restricciones
                };

                await _restriccionesService.SaveMisRestriccionesAsync(
                    responsable.rsvp_token,
                    restrDto
                );
            }
        }

        public async Task CargarInvitadosAsync(CargaInvitadosRequest req, long idUsuario)
        {
            var evento = await _context.ef_eventos.FindAsync(req.IdEvento);
            if (evento == null) throw new Exception("Evento inexistente");

            var emails = req.Invitados
                .Where(x => !string.IsNullOrEmpty(x.Email))
                .Select(x => x.Email!.ToLower())
                .ToList();

            var existentes = await _context.ef_invitados
                .Where(x => x.id_evento == req.IdEvento &&
                            x.email != null &&
                            emails.Contains(x.email.ToLower()) &&
                            x.activo)
                .Select(x => x.email!.ToLower())
                .ToListAsync();

            var invitadosValidos = req.Invitados
                .Where(x => string.IsNullOrEmpty(x.Email) ||
                            !existentes.Contains(x.Email.ToLower()))
                .Select(i => new ef_invitados
                {
                    id_evento = req.IdEvento,
                    nombre = i.Nombre,
                    apellido = i.Apellido,
                    email = i.Email,
                    celular = i.Celular,
                    rsvp_estado = "P",
                    rsvp_token = TokenUtility.Generate(64),
                    fecha_alta = DateTimeOffset.UtcNow,
                    activo = true,
                    id_usuario_invitador = idUsuario
                })
                .ToList();

            if (!invitadosValidos.Any())
                throw new Exception("Todos los invitados ya existen para este evento");

            _context.ef_invitados.AddRange(invitadosValidos);
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

        public async Task<string> GenerarLinkInvitacionAsync(string userId)
        {
            var clienteId = long.Parse(userId);

            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(e => e.id_cliente == clienteId);

            if (evento == null)
                throw new Exception("Evento no encontrado");

            var acceso = await _context.ef_evento_accesos
                .FirstOrDefaultAsync(a => a.id_evento == evento.id_evento && a.activo);

            if (acceso == null)
                throw new Exception("Acceso no encontrado");

            var token = TokenUtility.Generate(64);

            var link = new ef_evento_acceso_links
            {
                id_acceso = acceso.id_acceso,
                token = token,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
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
