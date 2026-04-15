using System.Threading.Tasks;

namespace API.Services
{
    public interface IFeatureGuardService
    {
        Task<bool> HasFeatureAsync(long id_evento, string feature_codigo);
        Task<bool> CanUploadFotoAsync(long id_evento, string? device_id);
        Task<bool> CanUseFotocabinaAsync(long id_evento, string? device_id);
        Task<int> GetFotoCountAsync(long id_evento);
    }
}
