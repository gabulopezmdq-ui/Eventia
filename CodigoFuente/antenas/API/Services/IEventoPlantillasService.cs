using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoPlantillasService
    {
        Task AplicarPlantillaAsync(long idEvento, short idPlantilla, bool borrarExistente = true);
    }
}
