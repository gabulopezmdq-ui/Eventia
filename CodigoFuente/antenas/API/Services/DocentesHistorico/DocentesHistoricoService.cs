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
    // Services/TokenService.cs
    public class TokenService : ITokenService
    {
        private readonly string _secretKey;

        public TokenService(string secretKey)
        {
            _secretKey = secretKey;
        }

        public string GenerarToken()
        {
            var timeString = DateTime.UtcNow.ToString("yyyyMMddHHmm");
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(timeString));
            return Convert.ToBase64String(hash);
        }
    }

    // Services/HistoricoDocentesClient.cs
    public class HistoricoDocentesClient : IHistoricoDocentesClient
    {
        private readonly HttpClient _httpClient;

        public HistoricoDocentesClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> GetHistoricoDocentes(string url, string apiKey, string token)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("X-API-Key", apiKey);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }
    }

    // Services/PartesDiariosService.cs
    public class PartesDiariosService : IPartesDiariosService
    {
        private readonly ITokenService _tokenService;
        private readonly IHistoricoDocentesClient _client;
        private readonly string _apiKey;

        public PartesDiariosService(
            ITokenService tokenService,
            IHistoricoDocentesClient client,
            string apiKey)
        {
            _tokenService = tokenService;
            _client = client;
            _apiKey = apiKey;
        }

        public async Task<string> ObtenerHistoricoDocentesAsync(DateTime desde, DateTime hasta)
        {
            if (desde > hasta)
                throw new ArgumentException("La fecha 'desde' no puede ser mayor a 'hasta'");

            var token = _tokenService.GenerarToken();
            var url = $"api/historicodocentes/{desde:yyyy-MM-dd}/{hasta:yyyy-MM-dd}";

            return await _client.GetHistoricoDocentes(url, _apiKey, token);
        }
    }
}