using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IFotocabinaService
    {
        Task<List<ef_evento_album_overlays>> GetOverlaysAsync(long id_evento);
        Task RegistrarUsoAsync(long id_evento, long id_overlay, long id_foto, string? device_id, long? id_invitado);
    }

    public class FotocabinaService : IFotocabinaService
    {
        private readonly DataContext _context;
        private readonly IFeatureGuardService _guard;

        public FotocabinaService(DataContext context, IFeatureGuardService guard)
        {
            _context = context;
            _guard = guard;
        }

        public async Task<List<ef_evento_album_overlays>> GetOverlaysAsync(long id_evento)
        {
            return await _context.ef_evento_album_overlays
                .Where(o => (o.id_evento == id_evento || o.id_evento == 0) && o.activo)
                .OrderBy(o => o.orden)
                .ToListAsync();
        }

        public async Task RegistrarUsoAsync(long id_evento, long id_overlay, long id_foto, string? device_id, long? id_invitado)
        {
            if (!await _guard.CanUseFotocabinaAsync(id_evento, device_id))
            {
                throw new Exception("Límite de usos de fotocabina alcanzado o feature no disponible.");
            }

            var uso = new ef_evento_album_fotocabina_usos
            {
                id_evento = id_evento,
                id_overlay = id_overlay,
                id_foto = id_foto,
                id_invitado = id_invitado,
                device_id = device_id,
                estado = "COMPLETADO",
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_album_fotocabina_usos.Add(uso);
            await _context.SaveChangesAsync();
        }
    }
}
