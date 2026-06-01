using System.Collections.Generic;
using System.Threading.Tasks;

public interface IRelacionesPersonaService
{
    Task<List<RelacionPersonaComboDTO>> ComboAsync(int idIdioma, string uso);
}