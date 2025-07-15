using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

public class PartesDiariosService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _secretKey;

    public PartesDiariosService(HttpClient httpClient, string apiKey, string secretKey)
    {
        _httpClient = httpClient;
        _apiKey = apiKey;
        _secretKey = secretKey;

        // Configuración base del HttpClient
        _httpClient.BaseAddress = new Uri("https://pd.mardelplata.gob.ar/");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<string> ObtenerHistoricoDocentes(DateTime desde, DateTime hasta)
    {
        // 1. Generar el token
        var token = GenerarToken();

        // 2. Construir la URL según especificación
        string url = $"api/historicodocentes/{desde:yyyy-MM-dd}/{hasta:yyyy-MM-dd}";

        // 3. Configurar la solicitud según requisitos
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("X-API-Key", _apiKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 4. Enviar la solicitud
        var response = await _httpClient.SendAsync(request);

        // 5. Procesar la respuesta
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    private string GenerarToken()
    {
        // Paso 1: Obtener timestamp en formato especificado
        var timeString = DateTime.UtcNow.ToString("yyyyMMddHHmm");

        // Paso 2: Calcular HMAC-SHA256
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey)))
        {
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(timeString));

            // Paso 3: Codificar en Base64
            return Convert.ToBase64String(hash);
        }
    }
}