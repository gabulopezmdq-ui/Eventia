using System.Security.Cryptography;
using System.Text;

namespace API.Services.Musica
{
    public class MusicaHelperService
    {
        public static string Normalizar(string titulo, string? artista)
        {
            var t = (titulo ?? "").Trim().ToLowerInvariant();
            var a = (artista ?? "").Trim().ToLowerInvariant();
            return $"{t}|{a}";
        }

        public static string Sha256Hex(string input)
        {
            using (var sha = SHA256.Create())
            {
                var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
                var sb = new StringBuilder(bytes.Length * 2);
                foreach (var b in bytes) sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }
    }
}