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
                // Caso 1: invitado precargado
                idEvento = invitadoPrecargado.id_evento;
                responsable = invitadoPrecargado;

                // Verificar que no haya confirmado ya
                if (responsable.rsvp_estado != "P")
                    throw new Exception("Este invitado ya ha confirmado previamente.");
            }
            else
            {
                // Caso 2: link genérico
                idEvento = accesoLink.acceso.id_evento;
                // Crear nuevo responsable (sin datos precargados)
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
                    rsvp_token = TokenUtility.Generate(64), // nuevo token personal para futuras gestiones
                    qr_token = TokenUtility.Generate(64),
                    id_acceso = accesoLink.id_acceso
                };
            }

            // 4. Obtener el evento (necesario para valores por defecto en caso precargado)
            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(e => e.id_evento == idEvento);
            if (evento == null)
                throw new Exception("Evento no encontrado.");

            // 5. Determinar id_acceso e id_acceso_link para el grupo
            long idAcceso;
            long idAccesoLink;
            int? maxPersonasTotal = null;
            int? maxAdultos = null;

            if (accesoLink != null)
            {
                // Caso link genérico: usamos los datos del link
                idAcceso = accesoLink.id_acceso;
                idAccesoLink = accesoLink.id_acceso_link;
                maxPersonasTotal = accesoLink.max_personas_total;
                maxAdultos = accesoLink.max_adultos;
            }
            else
            {
                // Caso invitado precargado: necesitamos obtener acceso y link por defecto
                // Primero el acceso
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
                    // Buscar cualquier acceso activo del evento
                    var accesoDefault = await _context.ef_evento_accesos
                        .Where(a => a.id_evento == idEvento && a.activo)
                        .OrderBy(a => a.orden)
                        .FirstOrDefaultAsync();
                    if (accesoDefault == null)
                        throw new Exception("El evento no tiene accesos configurados.");
                    idAcceso = accesoDefault.id_acceso;
                }

                // Luego el link activo para ese acceso
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

            // 6. Crear grupo (con valores ya resueltos)
            int total = 1 + (dto.Ninos?.Count ?? 0);
            var grupo = new ef_rsvp_grupos
            {
                id_evento = idEvento,
                id_acceso = idAcceso,
                id_acceso_link = idAccesoLink,
                max_personas_total = maxPersonasTotal ?? 100, // valor por defecto si no hay
                max_adultos = maxAdultos,
                cantidad_total = total,
                rsvp_estado = dto.Asiste ? "Y" : "N",
                rsvp_mensaje = dto.Mensaje,
                fecha_rsvp = DateTimeOffset.UtcNow,
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true
            };

            // 7. Asignar responsable al grupo
            grupo.integrantes.Add(new ef_rsvp_grupo_integrantes
            {
                invitado = responsable,
                rol = "T",
                rol_evento = "R",
                orden = 1
            });

            // 8. Agregar niños
            int orden = 2;
            var ninos = new List<ef_invitados>();
            if (dto.Ninos != null)
            {
                foreach (var n in dto.Ninos)
                {
                    var nino = new ef_invitados
                    {
                        id_evento = idEvento,
                        nombre = n.Nombre.Trim(),
                        apellido = n.Apellido.Trim(),
                        rsvp_estado = dto.Asiste ? "Y" : "N",
                        fecha_alta = DateTimeOffset.UtcNow,
                        activo = true,
                        rsvp_token = TokenUtility.Generate(64),
                        qr_token = TokenUtility.Generate(64),
                        id_acceso = idAcceso // usamos el mismo acceso que el grupo
                    };
                    grupo.integrantes.Add(new ef_rsvp_grupo_integrantes
                    {
                        invitado = nino,
                        rol = "A",
                        rol_evento = "N",
                        orden = orden++
                    });
                    ninos.Add(nino);
                }
            }

            // 9. Guardar grupo (primera vez, se generan las identidades)
            _context.ef_rsvp_grupos.Add(grupo);
            await _context.SaveChangesAsync();

            // 10. Asignar id_rsvp_grupo a responsable y niños
            responsable.id_rsvp_grupo = grupo.id_rsvp_grupo;
            foreach (var nino in ninos)
                nino.id_rsvp_grupo = grupo.id_rsvp_grupo;

            // 11. Guardar cambios finales
            await _context.SaveChangesAsync();
            if (dto.Restricciones != null && dto.Restricciones.Any())
            {
                var restrDto = new RestriccionesGrupoUpsertDTO
                {
                    Integrantes = dto.Restricciones
                };

                await _restriccionesService.SaveMisRestriccionesAsync(
                    responsable.rsvp_token,
                    restrDto);

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
    }
}
