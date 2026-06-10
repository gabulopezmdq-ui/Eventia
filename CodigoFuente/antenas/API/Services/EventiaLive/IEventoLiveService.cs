using API.DataSchema.DTO.EventiaLive;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.EventiaLive
{
    public interface IEventoLiveService
    {
        Task<List<LiveDinamicaDTO>> GetByEventoAsync(long idEvento);
        Task<long> CrearAsync(LiveCrearRequestDTO req);
        Task EditarAsync(long idDinamica, LiveEditarRequestDTO req);
        Task<string> CambiarEstadoAsync(long idDinamica, LiveCambiarEstadoRequestDTO req);
        Task<long> VotarAsync(LiveVotarRequestDTO req);
        Task<object> MarcarCorrectaYCalcularGanadoresAsync(LiveCalcularGanadoresRequestDTO req);
        Task<List<LiveGanadorDTO>> GetGanadoresAsync(long idDinamica);
        Task CambiarEstadoGanadorAsync(long idGanador, LiveGanadorEstadoRequestDTO req);
        Task<List<LivePremioDTO>> GetPremiosAsync(long idDinamica);
        Task<long> UpsertPremioAsync(LivePremioUpsertRequestDTO req);
    }
}