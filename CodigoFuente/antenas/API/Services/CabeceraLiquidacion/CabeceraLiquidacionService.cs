using API.DataSchema;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class CabeceraLiquidacionService : ICabeceraLiquidacionService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CabeceraLiquidacionService(DataContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // Método principal para procesar la cabecera de liquidación
        public async Task<string> AddCabeceraAsync(MEC_CabeceraLiquidacion cabecera)
        {
            // Obtener el userId desde el token
            int userId = GetUserIdFromToken();

            // Validar duplicados
            bool existe = await CheckIfExists(cabecera.AnioLiquidacion, cabecera.MesLiquidacion, cabecera.idTipoLiquidacion);
            if (existe)
            {
                throw new InvalidOperationException("Ya existe una Cabecera de Liquidación para el Mes/Año y Tipo de Liquidación.");
            }

            // Crear cabecera principal
            int cabeceraId = await SetLiquiAsync(cabecera, userId);

            // Crear cabecera de estados
            await SetEstadosAsync(cabeceraId, userId);

            // Generar cabeceras de bajas, si aplica
            if (cabecera.CalculaBajas == "S")
            {
                await GenerarCabecerasBajasAsync(cabeceraId, cabecera.AnioLiquidacion, cabecera.MesLiquidacion);
            }

            // Generar cabeceras de inasistencias, si aplica
            if (cabecera.CalculaInasistencias == "S")
            {
                await GenerarCabecerasInasistenciasAsync(cabeceraId, cabecera.AnioLiquidacion, cabecera.MesLiquidacion);
            }

            return "Cabecera agregada exitosamente.";
        }

        private int GetUserIdFromToken()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
            {
                throw new InvalidOperationException("Claim 'id' no encontrada en el token.");
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new InvalidOperationException("El valor de la claim 'id' no es un número válido.");
            }

            return userId;
        }

        // Método para verificar si ya existe un registro con el mismo Año, Mes y Tipo de Liquidación
        public async Task<bool> CheckIfExists(string anio, string mes, int idTipo)
        {
            return await _context.MEC_CabeceraLiquidacion
                .AnyAsync(c => c.AnioLiquidacion == anio && c.MesLiquidacion == mes && c.idTipoLiquidacion == idTipo);
        }

        // Crear cabecera principal
        public async Task<int> SetLiquiAsync(MEC_CabeceraLiquidacion cabecera, int userId)
        {
            cabecera.Estado = "P";
            cabecera.IdUsuario = userId;
            cabecera.Vigente = "S";

            _context.Add(cabecera);
            await _context.SaveChangesAsync();

            return cabecera.IdCabecera; // Asumiendo que IdCabeceraLiquidacion es la clave primaria.
        }

        // Crear cabecera de estados
        public async Task SetEstadosAsync(int cabeceraId, int userId)
        {
            var estado = new MEC_CabeceraLiquidacionEstados
            {
                IdCabecera = cabeceraId,
                Estado = "P",
                FechaCambioEstado = DateTime.Now,
                IdUsuario = userId
            };

            _context.Add(estado);
            await _context.SaveChangesAsync();
        }

        // Generar cabeceras de bajas
        public async Task GenerarCabecerasBajasAsync(int cabeceraId, string anio, string mes)
        {
            var establecimientos = await _context.MEC_Establecimientos
                .Where(e => e.Vigente == "S")
                .ToListAsync();

            foreach (var establecimiento in establecimientos)
            {
                bool existe = await _context.MEC_BajasCabecera
                    .AnyAsync(b => b.IdCabecera == cabeceraId && b.IdEstablecimiento == establecimiento.IdEstablecimiento);

                if (!existe)
                {
                    var bajaCabecera = new MEC_BajasCabecera
                    {
                        IdCabecera = cabeceraId,
                        IdEstablecimiento = establecimiento.IdEstablecimiento,
                        Anio = int.Parse(anio),
                        Mes = int.Parse(mes),
                        Estado = "P",
                        FechaApertura = DateTime.Today,
                        SinNovedades = "N"
                    };

                    _context.Add(bajaCabecera);
                }
            }

            await _context.SaveChangesAsync();
        }

        // Generar cabeceras de inasistencias
        public async Task GenerarCabecerasInasistenciasAsync(int cabeceraId, string anio, string mes)
        {
            var establecimientos = await _context.MEC_Establecimientos
                .Where(e => e.Vigente == "S")
                .ToListAsync();

            foreach (var establecimiento in establecimientos)
            {
                bool existe = await _context.MEC_InasistenciasCabecera
                    .AnyAsync(i => i.IdCabecera == cabeceraId && i.IdEstablecimiento == establecimiento.IdEstablecimiento);

                if (!existe)
                {
                    var inasistenciaCabecera = new MEC_InasistenciasCabecera
                    {
                        IdCabecera = cabeceraId,
                        IdEstablecimiento = establecimiento.IdEstablecimiento,
                        Anio = int.Parse(anio),
                        Mes = int.Parse(mes),
                        Estado = "P",
                        FechaApertura = DateTime.Today,
                        SinNovedades = "N"
                    };

                    _context.Add(inasistenciaCabecera);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
