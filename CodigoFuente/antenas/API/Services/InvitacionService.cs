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

        public InvitacionService(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<string> GenerarLinkAsync(long idEvento, long idUsuario)
        {
            var evento = await _context.ef_eventos.FindAsync(idEvento);
            if (evento == null) throw new Exception("Evento inexistente");

            var token = TokenUtility.Generate(64);

            evento.rsvp_public_token = token;
            evento.id_usuario_rsvp_link_creator = idUsuario;

            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<object> ObtenerEventoAsync(string token)
        {
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.rsvp_public_token == token);

            if (evento == null) throw new Exception("Link inválido");

            return new
            {
                evento.anfitriones_texto,
                evento.fecha_hora,
                evento.lugar,
                evento.direccion,
                evento.saludo,
                evento.mensaje_bienvenida
            };
        }

        public async Task ConfirmarAsync(string token, RsvpConfirmacionDTO dto)
        {
            var evento = await _context.ef_eventos
                .FirstOrDefaultAsync(x => x.rsvp_public_token == token);

            if (evento == null) throw new Exception("Evento inválido");

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existe = await _context.ef_invitados.AnyAsync(x =>
                    x.id_evento == evento.id_evento &&
                    x.email != null &&
                    x.email.ToLower() == dto.Email.ToLower() &&
                    x.activo
                );

                if (existe)
                    throw new Exception("Este email ya fue registrado para este evento");
            }

            var invitado = new ef_invitados
            {
                id_evento = evento.id_evento,
                nombre = dto.Nombre,
                apellido = dto.Apellido,
                email = dto.Email,
                celular = dto.Celular,
                rsvp_estado = dto.Asiste ? "Y" : "N",
                rsvp_mensaje = dto.Mensaje,
                fecha_rsvp = DateTimeOffset.UtcNow,
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true,
                rsvp_token = TokenUtility.Generate(64),
                id_usuario_invitador = evento.id_usuario_rsvp_link_creator
            };

            _context.ef_invitados.Add(invitado);
            await _context.SaveChangesAsync();
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

    }
}
