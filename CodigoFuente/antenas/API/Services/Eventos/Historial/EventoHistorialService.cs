using API.DataSchema;
using API.DataSchema.DTO.Eventos.Historial;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos.Historial
{
    public class EventoHistorialService : IEventoHistorialService
    {
        private readonly DataContext _context;

        public EventoHistorialService(DataContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(
            long idEvento,
            string modulo,
            string accion,
            string? entidad,
            long? idEntidad,
            string descripcion,
            long? idUsuario)
        {
            if (idEvento <= 0)
                return;

            if (string.IsNullOrWhiteSpace(modulo))
                return;

            if (string.IsNullOrWhiteSpace(accion))
                return;

            if (string.IsNullOrWhiteSpace(descripcion))
                return;

            string? usuarioSnapshot = null;

            if (idUsuario.HasValue && idUsuario.Value > 0)
            {
                usuarioSnapshot = await _context.ef_usuarios
                    .Where(x => x.id_usuario == idUsuario.Value)
                    .Select(x =>
                        ((x.nombre ?? "") + " " + (x.apellido ?? "")).Trim() != ""
                            ? ((x.nombre ?? "") + " " + (x.apellido ?? "")).Trim()
                            : x.email)
                    .FirstOrDefaultAsync();
            }

            var entity = new ef_evento_historial
            {
                id_evento = idEvento,
                modulo = modulo.Trim().ToUpper(),
                accion = accion.Trim().ToUpper(),
                entidad = string.IsNullOrWhiteSpace(entidad) ? null : entidad.Trim(),
                id_entidad = idEntidad,
                descripcion = descripcion.Trim(),
                id_usuario = idUsuario,
                usuario_snapshot = usuarioSnapshot,
                fecha = DateTime.UtcNow
            };

            _context.ef_evento_historial.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<List<EventoHistorialDTO>> GetByEventoAsync(
            long idEvento,
            string? modulo,
            int take)
        {
            if (take <= 0 || take > 200)
                take = 100;

            var query = _context.ef_evento_historial
                .Where(x => x.id_evento == idEvento);

            if (!string.IsNullOrWhiteSpace(modulo))
            {
                string moduloUpper = modulo.Trim().ToUpper();
                query = query.Where(x => x.modulo == moduloUpper);
            }

            return await query
                .OrderByDescending(x => x.fecha)
                .Take(take)
                .Select(x => new EventoHistorialDTO
                {
                    id_historial = x.id_historial,
                    id_evento = x.id_evento,
                    modulo = x.modulo,
                    accion = x.accion,
                    entidad = x.entidad,
                    id_entidad = x.id_entidad,
                    descripcion = x.descripcion,
                    id_usuario = x.id_usuario,
                    usuario_snapshot = x.usuario_snapshot,
                    fecha = x.fecha
                })
                .ToListAsync();
        }
    }
}