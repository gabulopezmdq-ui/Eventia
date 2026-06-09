using API.DataSchema.DTO.EventiaLive;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.EventiaLive
{
    public interface IEventoLiveService
    {
        Task<List<LiveDinamicaDTO>> GetByEventoAsync(long idEvento);
        Task<long> CrearAsync(LiveCrearRequestDTO req);
        Task<string> CambiarEstadoAsync(long idDinamica, LiveCambiarEstadoRequestDTO req);
        Task<long> VotarAsync(LiveVotarRequestDTO req);
        Task<object> MarcarCorrectaYCalcularGanadoresAsync(LiveCalcularGanadoresRequestDTO req);
    }
}