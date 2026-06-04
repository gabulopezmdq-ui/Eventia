using API.DataSchema.DTO.Eventos.Checklist;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Checklist
{
    public interface IChecklistPrioridadesService
    {
        Task<List<ChecklistPrioridadComboDTO>> ComboAsync(int idIdioma);
    }
}