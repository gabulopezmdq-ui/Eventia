using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface ICuentaHospedajePlantillasService
    {
        Task<long> CrearOActualizarPlantillaAsync(long idUsuario, CuentaHospedajePlantillaUpsertRequestDTO req);
        Task<List<CuentaHospedajePlantillaDTO>> MisPlantillasAsync(long idUsuario, bool soloActivas, long? idUnidad, string? q);
        Task<CuentaHospedajePlantillaDTO?> GetPlantillaAsync(long idUsuario, long idPlantilla);

        Task<List<CuentaHospedajePlantillaItemDTO>> GetItemsAsync(long idUsuario, long idPlantilla);
        Task<long> UpsertItemAsync(long idUsuario, long idPlantilla, CuentaHospedajePlantillaItemUpsertRequestDTO req);
        Task<bool> DeleteItemAsync(long idUsuario, long idPlantilla, long idItem);

        Task<object> AplicarAEventoAsync(long idUsuario, long idPlantilla, CuentaHospedajePlantillaAplicarRequestDTO req);
    }
}