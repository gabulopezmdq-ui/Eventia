using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.DataSchema;
using API.Services;
using API.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using rsAPIElevador.DataSchema;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Services
{
    public class PartesDiariosService : IPartesDiariosService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://pd.mardelplata.gob.ar/";

        public PartesDiariosService(HttpClient httpClient)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _httpClient.BaseAddress = new Uri(BaseUrl);
        }

        public async Task<string> ObtenerHistoricoDocentesAsync(string desde, string hasta, string secretKey)
        {
            if (string.IsNullOrWhiteSpace(desde))
                throw new ArgumentException("La fecha 'desde' no puede estar vacía", nameof(desde));

            if (string.IsNullOrWhiteSpace(hasta))
                throw new ArgumentException("La fecha 'hasta' no puede estar vacía", nameof(hasta));

            if (string.IsNullOrWhiteSpace(secretKey))
                throw new ArgumentException("La clave secreta no puede estar vacía", nameof(secretKey));

            // Generar el token API Key
            string apiKey = GenerarApiKey(secretKey);

            // Configurar los headers de la solicitud
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);

            // Construir la URL del endpoint actualizado
            string endpoint = $"api/historicodocente/exportar/{desde}/{hasta}";

            // Realizar la solicitud HTTP
            HttpResponseMessage response = await _httpClient.GetAsync(endpoint);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public string GenerarApiKey(string secretKey, DateTime? timestamp = null)
        {
            var time = timestamp ?? DateTime.Now;
            var timeString = time.ToString("yyyyMMddHHmm");

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(timeString));
                return Convert.ToBase64String(hash);
            }
        }
    }
}