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
using System.Text.Json;

namespace API.Services
{
    public class PartesDiariosService : IPartesDiariosService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://pd.mardelplata.gob.ar/";

        private readonly DataContext _context;

        public PartesDiariosService(HttpClient httpClient, DataContext context)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _httpClient.BaseAddress = new Uri(BaseUrl);

            _context = context ?? throw new ArgumentNullException(nameof(context));
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

        //GUARDAR REGISTROS
        public async Task ImportarJSON(string json, int idCabecera, int idInasistenciasCabecera)
        {
            var opciones = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var registros = JsonSerializer.Deserialize<List<InasistenciasDTO>>(json, opciones);

            if (registros == null || !registros.Any())
                throw new Exception("El JSON no contenía registros válidos.");


            //eliminar esta parte para agregar un boton que elimine los registros
            // 1. Borrar primero tabla de errores (dependiente)
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"MEC_TMPErroresInasistenciasDetalle\"");

            // 2. Borrar tabla principal
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"MEC_TMPInasistenciasDetalle\"");

            // 3. Reiniciar secuencias
            await _context.Database.ExecuteSqlRawAsync(
                @"DO $$
            DECLARE seq_name text;
            BEGIN
                SELECT pg_get_serial_sequence('""MEC_TMPInasistenciasDetalle""', 'IdTMPInasistenciasDetalle')
                INTO seq_name;
                IF seq_name IS NOT NULL THEN
                    EXECUTE format('ALTER SEQUENCE %s RESTART WITH 1', seq_name);
                END IF;

                SELECT pg_get_serial_sequence('""MEC_TMPErroresInasistenciasDetalle""', 'IdTMPErrorInasistencia')
                INTO seq_name;
                IF seq_name IS NOT NULL THEN
                    EXECUTE format('ALTER SEQUENCE %s RESTART WITH 1', seq_name);
                END IF;
            END$$;");

            var entidades = registros.Select(dto => new MEC_TMPInasistenciasDetalle
            {
                IdCabecera = idCabecera,
                IdInasistenciaCabecera = idInasistenciasCabecera,
                DNI = dto.DNI.ToString("D8"),
                NroLegajo = dto.NroLegajo,
                NroCargo = dto.NroCargo,
                UE = dto.CodDepend,
                Grupo = dto.CodGrupo,
                Nivel = dto.CodNivel,
                Modulo = dto.Modulo,
                Cargo = dto.Cargo,
                FecNov = dto.FecNoved,
                CodLicen = dto.CodLicen,
                Cantidad = dto.Cantidad,
                Hora = dto.Horas,
                RegistroValido = "N",
                RegistroProcesado = "N"
            }).ToList();

            _context.MEC_TMPInasistenciasDetalle.AddRange(entidades);
            await _context.SaveChangesAsync();
        }
    }
}