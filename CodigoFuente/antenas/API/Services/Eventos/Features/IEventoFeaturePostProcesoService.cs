using System.Threading.Tasks;

namespace API.Services.Eventos.Features
{
    public interface IEventoFeaturePostProcesoService
    {
        Task SincronizarAsync(long idEvento);
    }
}