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
            string varUE = UE.Replace("-", "");

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
                    var error = new MEC_TMPErroresInasistenciasDetalle
                    {
                        IdCabeceraInasistencia = idCabeceraLiquidacion,
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

                tmp.RegistroValido = "S";
                tmp.RegistroProcesado = "S";
            }

            await _context.SaveChangesAsync();
        }



        public async Task ProcesarInasistenciaAsync(int idCabeceraInasistencia, int idPOF, int idPOFBarra, int idTMPInasistenciasDetalle, int? codLicencia, DateTime fecha, int cantHs)
        {
            // 1. Validar que no exista el registro en MEC_InasistenciasDetalle
            var yaExiste = await _context.MEC_InasistenciasDetalle
                .AnyAsync(x => x.IdPOF == idPOF && x.IdPOFBarra == idPOFBarra && x.Fecha == fecha.Date);

            if (yaExiste)
            {
                // Ya existe, no se inserta
                return;
            }

            // 2. Insertar en MEC_InasistenciasDetalle
            var nuevoDetalle = new MEC_InasistenciasDetalle
            {
                IdInasistenciasCabecera = idCabeceraInasistencia,
                IdPOF = idPOF,
                IdPOFBarra = idPOFBarra,
                IdTMPInasistenciasDetalle = idTMPInasistenciasDetalle,
                CodLicencia = codLicencia,
                Fecha = fecha,
                CantHs = cantHs,
                EstadoRegistro = "P",
            };

            _context.MEC_InasistenciasDetalle.Add(nuevoDetalle);

            // 3. Actualizar RegistroProcesado = "I" en MEC_TMPInasistenciasDetalle
            var registroTMP = await _context.MEC_TMPInasistenciasDetalle
                .FirstOrDefaultAsync(x => x.IdTMPInasistenciasDetalle == idTMPInasistenciasDetalle);

            if (registroTMP != null)
            {
                registroTMP.RegistroProcesado = "I";
            }

            await _context.SaveChangesAsync();
        }


        public async Task<List<MEC_InasistenciasCabecera>> ObtenerCabecerasHabilitadasAsync()
        {
            return await _context.MEC_InasistenciasCabecera
                .Where(c => c.Estado == "I")
                .ToListAsync();
        }

        //VALIDACION DE REGISTRO MEC_INASISTENCIASDETALLE
        public async Task<(bool Valido, string? Mensaje)> ValidarEstadoRegistro(int? idCabecera)
        {
            var registrosIncompletos = await _context.MEC_InasistenciasDetalle
                .Where(d => d.IdInasistenciasCabecera == idCabecera && string.IsNullOrEmpty(d.EstadoRegistro))
                .AnyAsync();

            if (registrosIncompletos)
            {
                return (false, "Para poder continuar, debe procesar todos los días de inasistencia como aprobados o rechazados");
            }

            return (true, null);
        }


        //BOTON "DEVOLVER A EST"
        public async Task<(bool Exito, string? Mensaje)> DevolverAEstablecimientoAsync(
                            int idCabecera,
                            int usuario,
                            string motivoRechazo)
        {
            // Validar que todos los registros esten procesados
            var (valido, mensaje) = await ValidarEstadoRegistro(idCabecera);
            if (!valido)
            {
                return (false, mensaje);
            }

            // Obtener la cabecera
            var cabecera = await _context.MEC_InasistenciasCabecera
                .FirstOrDefaultAsync(c => c.IdInasistenciaCabecera == idCabecera);

            if (cabecera == null)
            {
                return (false, "No se encontró la cabecera de inasistencia");
            }

            // Cambiar estado a "R"
            cabecera.Estado = "R";

            // Obtener los registros a rechazar
            var registrosRechazados = await _context.MEC_InasistenciasDetalle
                .Where(d => d.IdInasistenciasCabecera == idCabecera && d.EstadoRegistro == "R")
                .ToListAsync();

            foreach (var registro in registrosRechazados)
            {
                var rechazo = new MEC_InasistenciasRechazo
                {
                    IdInasistenciaDetalle = registro.IdInasistenciasDetalle,
                    UsuarioRechazo = usuario,
                    MotivoRechazo = motivoRechazo,
                    FechaEnvio = DateTime.Now
                };

                _context.MEC_InasistenciasRechazo.Add(rechazo);
            }

            await _context.SaveChangesAsync();
            return (true, null);
        }

        //BOTON "MARCAR CORREGIDO EDUCACION"
        public async Task<(bool Exito, string? Mensaje)> CorregidoEducacion(int? idCabecera)
        {
            
            // Validar que todos los registros esten procesados
            var (valido, mensaje) = await ValidarEstadoRegistro(idCabecera);
            if (!valido)
            {
                return (false, mensaje);
            }

            if (idCabecera == null || idCabecera <= 0)
            {
                return (false, "Debe seleccionar una Cabecera de Liquidación");
            }

            var cabecera = await _context.MEC_InasistenciasCabecera
                .FirstOrDefaultAsync(c => c.IdInasistenciaCabecera == idCabecera);

            if (cabecera == null)
            {
                return (false, "No se encontró la Cabecera de Inasistencia seleccionada");
            }

            
            cabecera.Estado = "C";

            await _context.SaveChangesAsync();

            return (true, null);
        }

    }
}