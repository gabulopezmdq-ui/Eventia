using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IAutorizacionesService
    {
        Task<AutorizacionDTO> CreateAsync(long idEvento, AutorizacionCreateDTO dto);
        Task<List<AutorizacionDTO>> ListAsync(long idEvento, long idInvitadoObjetivo, string tipo);
        Task DisableAsync(long idEvento, long idAutorizacion);
        Task<AutorizacionDTO> UpdateAsync(long idEvento, long idAutorizacion, AutorizacionUpdateDTO dto);
        Task<List<AutorizacionDTO>> CreateFromPersonalLinkAsync(
                 string rsvpToken,
                 AutorizacionFromPersonalLinkDTO dto);

    }


}