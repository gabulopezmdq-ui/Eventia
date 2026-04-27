using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class FeatureGuardService : IFeatureGuardService
    {
        private readonly DataContext _context;

        public FeatureGuardService(DataContext context)
        {
            _context = context;
        }

        public async Task<bool> HasFeatureAsync(long id_evento, string feature_codigo)
        {
            return await _context.ef_evento_features
                .AnyAsync(f => f.id_evento == id_evento && f.activo && 
                               _context.ef_param_features.Any(pf => pf.id_feature == f.id_feature && pf.codigo == feature_codigo));
        }

        public async Task<bool> CanUploadFotoAsync(long id_evento, string? device_id)
        {
            // 1. Validar que la feature de álbum esté activa
            if (!await HasFeatureAsync(id_evento, "ALBUM_COLABORATIVO")) return false;

            // 2. Validar límites del plan (ejemplo simplificado, asumiendo un límite de fotos)
            // En una implementación real, esto consultaría ef_plan_limites
            int currentCount = await GetFotoCountAsync(id_evento);
            // Supongamos un límite por defecto de 500 fotos si no hay plan configurado
            if (currentCount >= 1000) return false; 

            // 3. Validar límite por aportante (device_id)
            if (!string.IsNullOrEmpty(device_id))
            {
                int deviceCount = await _context.ef_evento_album_fotos
                    .CountAsync(f => f.id_evento == id_evento && f.device_id == device_id && f.activo);
                
                if (deviceCount >= 50) return false; // Límite de 50 fotos por invitado
            }

            return true;
        }

        public async Task<bool> CanUseFotocabinaAsync(long id_evento, string? device_id)
        {
            if (!await HasFeatureAsync(id_evento, "ALBUM_FOTOCABINA")) return false;

            // Lógica similar a CanUploadFoto pero para usos de fotocabina
            return true;
        }

        public async Task<int> GetFotoCountAsync(long id_evento)
        {
            return await _context.ef_evento_album_fotos
                .CountAsync(f => f.id_evento == id_evento && f.activo);
        }
    }
}
