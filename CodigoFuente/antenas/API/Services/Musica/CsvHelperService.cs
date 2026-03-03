using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace API.Services.Musica
{
    public static class CsvHelper
    {
        public static string Escape(string? value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            var v = value.Replace("\"", "\"\"");
            return v.Contains(",") || v.Contains("\n") || v.Contains("\r") ? $"\"{v}\"" : v;
        }

        public static byte[] ToCsvBytes(IEnumerable<string[]> rows)
        {
            var sb = new StringBuilder();
            foreach (var r in rows)
            {
                sb.AppendLine(string.Join(",", r.Select(Escape)));
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
