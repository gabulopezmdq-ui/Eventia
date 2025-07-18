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
    public class CabeceraInasistenciasService : ICabeceraInasistenciasService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CabeceraInasistenciasService(DataContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // Método principal para procesar la cabecera de liquidación
        public async Task<bool> AddCabeceraAsync(int idCabecera)
        {
            // Obtener el userId desde el token
            int userId = GetUserIdFromToken();

            var cabeceraLiquidacion = await _context.MEC_CabeceraLiquidacion.AsNoTracking().FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            var nuevaCabecera = new MEC_InasistenciasCabecera
            {
                IdCabecera = idCabecera,
                Estado = "H",
                Anio = int.Parse(cabeceraLiquidacion.AnioLiquidacion),
                Mes = int.Parse(cabeceraLiquidacion.MesLiquidacion),
                Confecciono = userId,
                FechaApertura = DateTime.Now,
            };

            _context.MEC_InasistenciasCabecera.Add(nuevaCabecera);
            await _context.SaveChangesAsync();

            return true;
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
        public async Task<bool> CheckIfExists(string anio, string mes, int idTipo, string ordenPago)
        {
            return await _context.MEC_CabeceraLiquidacion
                .AnyAsync(c => c.AnioLiquidacion == anio && c.MesLiquidacion == mes && c.idTipoLiquidacion == idTipo && c.OrdenPago == ordenPago);
        }

        //PROCESAR INASISTENCIAS

        public async Task ProcesarTMPInasistencias(int idCabeceraLiquidacion, int idCabeceraInasistencia, int idEstablecimiento, string UE)
        {
            string varUE = UE.Replace("-", ""); // limpieza de guión

            var registrosTMP = await _context.MEC_TMPInasistenciasDetalle
                .Where(x => x.IdCabecera == idCabeceraLiquidacion
                            && x.IdInasistenciaCabecera == idCabeceraInasistencia
                            && x.UE == varUE
                            && x.RegistroProcesado == "N")
                .ToListAsync();

            foreach (var tmp in registrosTMP)
            {
                // 1. Validar existencia del documento (DNI)
                var persona = await _context.MEC_Personas
                    .FirstOrDefaultAsync(p => p.DNI == tmp.DNI);

                if (persona == null)
                {
                    // Insertar error: Documento NO existe
                    var error = new MEC_TMPErroresInasistenciasDetalle
                    {
                        IdCabeceraInasistencia = idCabeceraLiquidacion, // fijate que va el idCabeceraInasistencia, no el de liquidación
                        IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                        Documento = "NE",
                        Legajo = "NE",
                        POF = "NE",
                        POFBarra = "NE"
                    };
                    _context.MEC_TMPErroresInasistenciasDetalle.Add(error);

                    tmp.RegistroValido = "N";
                    tmp.RegistroProcesado = "S";

                    continue;
                }

                // 2. Validar que el Legajo coincida con el NroLegajo
                if (persona.Legajo != tmp.NroLegajo?.ToString())
                {
                    _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                    {
                        IdCabeceraInasistencia = idCabeceraLiquidacion,
                        IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                        Documento = "OK",
                        Legajo = "NE",
                        POF = "NE",
                        POFBarra = "NE"
                    });

                    tmp.RegistroValido = "N";
                    tmp.RegistroProcesado = "S";
                    continue;
                }

                var idPersona = persona.IdPersona;

                // 3. Validar existencia de registros en POF para ese Establecimiento + Persona
                var pofs = await _context.MEC_POF
                    .Where(p => p.IdEstablecimiento == idEstablecimiento && p.IdPersona == idPersona)
                    .ToListAsync();

                if (!pofs.Any())
                {
                    _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                    {
                        IdCabeceraInasistencia = idCabeceraLiquidacion,
                        IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                        Documento = "OK",
                        Legajo = "OK",
                        POF = "NE",
                        POFBarra = "NE"
                    });

                    tmp.RegistroValido = "N";
                    tmp.RegistroProcesado = "S";

                    continue;
                }

                // 4. Validar que alguna de las barras coincida con NroCargo
                bool barraCoincide = false;

                foreach (var pof in pofs)
                {
                    barraCoincide = await _context.MEC_POF_Barras
                        .AnyAsync(b => b.IdPOF == pof.IdPOF && b.Barra == tmp.NroCargo);

                    if (barraCoincide)
                        break;
                }

                if (!barraCoincide)
                {
                    tmp.RegistroValido = "N";
                    tmp.RegistroProcesado = "S";

                    _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                    {
                        IdCabeceraInasistencia = idCabeceraLiquidacion,
                        IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                        Documento = "OK",
                        Legajo = "OK",
                        POF = "OK",
                        POFBarra = "NE"
                    });

                    continue;
                }

                // ✅ Registro válido
                tmp.RegistroValido = "S";
                tmp.RegistroProcesado = "S";
            }

            await _context.SaveChangesAsync();
        }


    }
}