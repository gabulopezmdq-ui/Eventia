using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IInvitacionService
    {
        Task<string> GenerarLinkAsync(long idEvento, long idUsuario);
        Task<object> ObtenerEventoAsync(string token);
        Task ConfirmarAsync(string token, RsvpConfirmacionDTO dto);
        Task CargarInvitadosAsync(CargaInvitadosRequest req, long idUsuario);

    }
}