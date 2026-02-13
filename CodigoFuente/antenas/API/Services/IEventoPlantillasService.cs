using API.DataSchema.DTO;
using System;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoPlantillasService
    {
        Task AplicarPlantillaAsync(
            long idEvento,
            short idPlantilla,
            DateTimeOffset fechaBase,
            string lugarBase = null,
            string direccionBase = null,
            decimal? latitudBase = null,
            decimal? longitudBase = null,
            bool borrarExistente = true
        );

        Task<EventoEstructuraDTO> GetEstructuraEventoAsync(long idEvento);
    }
}
