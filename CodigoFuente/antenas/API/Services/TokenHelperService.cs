using System;
using System.Security.Cryptography;

namespace API.Services
{
    public static class TokenHelper
    {
        public static string NewToken(int bytes = 24)
        {
            var data = new byte[bytes];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(data);
            }
            // Base64 URL-safe sin padding
            return Convert.ToBase64String(data)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }
    }
}

