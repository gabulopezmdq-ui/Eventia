using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public class CloudflareR2StorageService : IStorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _publicUrl;

        public CloudflareR2StorageService(IConfiguration config)
        {
            var r2Config = config.GetSection("CloudflareR2");
            var accessKey = r2Config["AccessKeyId"];
            var secretKey = r2Config["SecretAccessKey"];
            var serviceUrl = r2Config["Endpoint"];
            
            _bucketName = r2Config["BucketName"] ?? "eventia-album-test";
            _publicUrl = r2Config["PublicUrl"]?.TrimEnd('/') ?? "";

            var s3Config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true // R2 requiere esto
            };

            _s3Client = new AmazonS3Client(accessKey, secretKey, s3Config);
        }

        public async Task<StorageResult> SaveFileAsync(Stream stream, string fileName, string folder)
        {
            try
            {
                string fileId = Guid.NewGuid().ToString("N");
                string extension = Path.GetExtension(fileName);
                string storageKey = $"{folder}/{fileId}{extension}".Replace("\\", "/");

                var uploadRequest = new TransferUtilityUploadRequest
                {
                    InputStream = stream,
                    Key = storageKey,
                    BucketName = _bucketName,
                    DisablePayloadSigning = true // Requerido por R2
                };

                var fileTransferUtility = new TransferUtility(_s3Client);
                await fileTransferUtility.UploadAsync(uploadRequest);

                return new StorageResult
                {
                    Success = true,
                    Key = storageKey,
                    Url = $"{_publicUrl}/{storageKey}"
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

        public async Task DeleteFileAsync(string key)
        {
            try
            {
                var deleteObjectRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };
                await _s3Client.DeleteObjectAsync(deleteObjectRequest);
            }
            catch
            {
                // Log o ignorar según política
            }
        }

        public string GetPublicUrl(string key)
        {
            return $"{_publicUrl}/{key}";
        }
    }
}
