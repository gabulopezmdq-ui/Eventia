using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IQrService
    {
        Task<QrScanResponseDTO?> GetByQrTokenAsync(string qrToken);
    }

}