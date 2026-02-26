using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IAlimentacionService
    {
        Task<List<RestriccionAlimDTO>> GetCatalogoAsync(bool soloActivas = true);
        Task UpdateNinoAlimentacionFromPersonalAsync(string rsvpToken, long idInvitadoNino, NinoAlimentacionUpdateDTO dto);
        Task<List<NinoAlertaStaffDTO>> ListNinosAlertasAsync(long idEvento, short minSeveridad = 4);
    }

}