using API.DataSchema;
using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IMesasService
    {
        Task<ef_evento_mesas> CrearMesaAsync(MesaCreateDTO dto);
        Task<List<ef_evento_mesas>> GetMesasByTramoAsync(long idTramo);
        Task<List<MesaInvitadoDetalleDTO>> GetInvitadosDisponiblesParaTramoAsync(long idTramo);
        Task AsignarInvitadoAMesaAsync(MesaAsignarInvitadoDTO dto);
        Task<List<MesaInvitadoDetalleDTO>> GetInvitadosByMesaAsync(long idMesa);
        Task QuitarInvitadoDeMesaAsync(long idMesa, long idInvitado);
    }
}
