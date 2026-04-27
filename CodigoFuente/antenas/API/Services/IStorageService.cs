using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IStorageService
    {
        Task<StorageResult> SaveFileAsync(Stream stream, string fileName, string folder);
        Task DeleteFileAsync(string key);
        string GetPublicUrl(string key);
    }

    public class StorageResult
    {
        public bool Success { get; set; }
        public string? Key { get; set; }
        public string? Url { get; set; }
        public string? Error { get; set; }
    }
}
