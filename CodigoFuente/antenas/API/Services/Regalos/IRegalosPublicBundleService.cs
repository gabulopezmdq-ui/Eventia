using System.Threading.Tasks;
using API.DataSchema.DTO.Regalos;

namespace API.Services.Regalos
{
    public interface IRegalosPublicBundleService
    {
        Task<RegalosPublicBundleDTO?> GetBundleByInvitadoTokenAsync(string rsvp_token);
    }
}