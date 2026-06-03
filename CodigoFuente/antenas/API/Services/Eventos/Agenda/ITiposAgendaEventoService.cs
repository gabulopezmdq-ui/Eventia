using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Agenda
{
    public interface ITiposAgendaEventoService
    {
        Task<List<TipoAgendaEventoComboDTO>> ComboAsync(int idIdioma);
    }
}