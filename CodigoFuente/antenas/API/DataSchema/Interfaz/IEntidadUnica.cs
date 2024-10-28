using System.Collections.Generic;

namespace API.DataSchema.Interfaz
{
    public interface IEntidadUnica
    {
        // para evitar duplicados
        IEnumerable<string[]> PropUnica { get; }
    }
}
