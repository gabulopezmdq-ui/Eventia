using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public class StorageService : IStorageService
    {
        private readonly IWebHostEnvironment _env;

        public StorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<StorageResult> SaveFileAsync(Stream stream, string fileName, string folder)
        {
            try
            {
                // Estrategia Local: wwwroot/uploads/folder/filename
                string uploadsBase = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
                string targetPath = Path.Combine(uploadsBase, folder);

                if (!Directory.Exists(targetPath))
                {
                    Directory.CreateDirectory(targetPath);
                }

                string fileId = Guid.NewGuid().ToString("N");
                string extension = Path.GetExtension(fileName);
                string storageKey = $"{folder}/{fileId}{extension}";
                string fullPath = Path.Combine(uploadsBase, storageKey);

                using (var fileStream = new FileStream(fullPath, FileMode.Create))
                {
                    await stream.CopyToAsync(fileStream);
                }

                return new StorageResult
                {
                    Success = true,
                    Key = storageKey,
                    Url = $"/uploads/{storageKey}" // Nota: Requiere app.UseStaticFiles()
                };
            }
            catch (Exception ex)
            {
                return new StorageResult
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public Task DeleteFileAsync(string key)
        {
            string fullPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", key);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            return Task.CompletedTask;
        }

        public string GetPublicUrl(string key)
        {
            return $"/uploads/{key}";
        }
    }
}
