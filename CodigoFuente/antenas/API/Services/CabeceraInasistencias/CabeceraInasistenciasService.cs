using API.DataSchema;
using API.DataSchema.DTO;
using DocumentFormat.OpenXml.Office2013.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

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


        public async Task<List<MesAnioDTO?>> ObtenerFechas(int idEstablecimiento, int idCabecera)
        {
            var resultados = await _context.MEC_InasistenciasCabecera.Where(m => m.IdCabecera == idCabecera && m.IdEstablecimiento == idEstablecimiento)
                .Select(m => new MesAnioDTO
                {
                    Anio = m.Anio,
                    Mes = m.Mes
                }).Distinct().OrderBy(x => x.Anio).ThenBy(x => x.Mes).ToListAsync();

            return resultados;
        }
        public async Task<InasistenciaCabeceraDTO?> ObtenerInasistenciaPorPeriodoAsync(int idEstablecimiento, int anio, int mes)
        {
            // Buscar la cabecera de inasistencias que coincida con establecimiento, año y mes
            var cabecera = await _context.MEC_InasistenciasCabecera
                .Include(c => c.Detalle) // Cargar detalles relacionados
                .Include(c => c.Cabecera)
                .ThenInclude(cl => cl.TipoLiquidacion)
                .FirstOrDefaultAsync(c => c.IdEstablecimiento == idEstablecimiento
                                       && c.Anio == anio
                                       && c.Mes == mes);

            if (cabecera == null)
            {
                // No hay cabecera para ese periodo, devolver null o un DTO vacío
                return null;
            }

            // Mapear entidad a DTO
            var dto = new InasistenciaCabeceraDTO
            {
                IdInasistenciaCabecera = cabecera.IdInasistenciaCabecera,
                IdEstablecimiento = cabecera.IdEstablecimiento,
                IdCabecera = cabecera.IdCabecera,
                Confecciono = cabecera.Confecciono,
                Descripcion = cabecera.Cabecera?.TipoLiquidacion?.Descripcion,
                Mes = cabecera.Mes,
                Anio = cabecera.Anio,
                FechaApertura = cabecera.FechaApertura,
                FechaEntrega = cabecera.FechaEntrega,
                SinNovedades = cabecera.SinNovedades,
                Observaciones = cabecera.Observaciones,
                Estado = cabecera.Estado,
                Detalle = cabecera.Detalle.Select(d => new InasistenciaDetalleDto
                {
                    IdInasistenciaDetalle = d.IdInasistenciasDetalle,
                    IdInasistenciaCabecera = d.IdInasistenciaCabecera,
                    IdPOF = d.IdPOF,
                    FechaInasistencia = d.Fecha ?? DateTime.MinValue,
                    Estado = d.EstadoRegistro ?? ""
                }).ToList(),
                Rechazos = new List<InasistenciaRechazoDto>() // Podés cargar esto si querés
            };

            return dto;
        }


        // Método principal para procesar la cabecera de liquidación
        public async Task<MEC_InasistenciasCabecera> AddCabeceraAsync(int idCabecera, int idEstablecimiento, int año, int mes)
        {
            // Obtener el userId desde el token
            int userId = GetUserIdFromToken();

            // Verificar si ya existe una cabecera de inasistencia con esos datos
            var cabeceraExistente = await _context.MEC_InasistenciasCabecera
                .AsNoTracking()
                .FirstOrDefaultAsync(c =>
                    c.IdCabecera == idCabecera &&
                    c.Anio == año &&
                    c.Mes == mes &&
                    c.IdEstablecimiento == idEstablecimiento);

            if (cabeceraExistente != null)
            {
                // Ya existe, devolverla
                return cabeceraExistente;
            }

            var cabeceraLiquidacion = await _context.MEC_CabeceraLiquidacion.AsNoTracking().FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabeceraLiquidacion == null)
            {
                throw new InvalidOperationException($"No se encontró la cabecera de liquidación con Id {idCabecera}.");
            }

            var nuevaCabecera = new MEC_InasistenciasCabecera
            {
                IdCabecera = idCabecera,
                IdEstablecimiento = idEstablecimiento,
                Estado = "H",
                Anio = año,
                Mes = mes,
                Confecciono = userId,
                FechaApertura = DateTime.Now,
            };

            _context.MEC_InasistenciasCabecera.Add(nuevaCabecera);
            await _context.SaveChangesAsync();

            return nuevaCabecera;
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

        public async Task<List<MEC_TMPInasistenciasDetalle>> ObtenerInas()
        {
            var resultado = await _context.MEC_TMPInasistenciasDetalle.Where(m => m.RegistroProcesado == "S").ToListAsync();
            return resultado;
        }

        // Método para verificar si ya existe un registro con el mismo Año, Mes y Tipo de Liquidación
        public async Task<bool> CheckIfExists(string anio, string mes, int idTipo, string ordenPago)
        {
            return await _context.MEC_CabeceraLiquidacion
                .AnyAsync(c => c.AnioLiquidacion == anio && c.MesLiquidacion == mes && c.idTipoLiquidacion == idTipo && c.OrdenPago == ordenPago);
        }

        //PROCESAR INASISTENCIAS

        public async Task<string> ProcesarTMPInasistencias(
                                int idCabeceraLiquidacion,
                                int idCabeceraInasistencia,
                                int idEstablecimiento,
                                string UE)
        {
            string varUE = UE.Replace("-", "");
            var errores = new List<string>(); // Lista para acumular errores

            // --- 1. Verificar si ya existen errores registrados para este contexto ---
            var erroresExistentes = await _context.MEC_TMPErroresInasistenciasDetalle
                .Where(e => e.IdCabeceraInasistencia == idCabeceraLiquidacion)
                .Select(e => new
                {
                    e.IdTMPInasistenciasDetalle,
                    e.Documento,
                    e.Legajo,
                    e.POF,
                    e.POFBarra
                })
                .ToListAsync();

            if (erroresExistentes.Any())
            {
                errores.AddRange(erroresExistentes.Select(e =>
                    $"Error previo con TMP ID {e.IdTMPInasistenciasDetalle}: " +
                    $"Documento={e.Documento}, Legajo={e.Legajo}, POF={e.POF}, POFBarra={e.POFBarra}"));
            }

            // --- 2. Procesar los registros TMP no procesados ---
            var registrosTMP = await _context.MEC_TMPInasistenciasDetalle
                .Where(x => x.IdCabecera == idCabeceraLiquidacion
                            && x.IdInasistenciaCabecera == idCabeceraInasistencia
                            && x.UE == varUE
                            && x.RegistroProcesado == "N")
                .ToListAsync();

            foreach (var tmp in registrosTMP)
            {
                try
                {
                    // 1. Validar existencia del documento (DNI)
                    var persona = await _context.MEC_Personas
                        .FirstOrDefaultAsync(p => p.DNI == tmp.DNI);

                    if (persona == null)
                    {
                        // Evita duplicados: busca si ya existe exactamente el mismo error
                        var errorYaRegistrado = await _context.MEC_TMPErroresInasistenciasDetalle
                            .AnyAsync(e =>
                                e.IdTMPInasistenciasDetalle == tmp.IdTMPInasistenciasDetalle &&
                                e.Documento == tmp.DNI &&
                                e.Legajo == "NE" &&
                                e.POF == "NE" &&
                                e.POFBarra == "NE");

                        if (!errorYaRegistrado)
                        {
                            _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                            {
                                IdCabeceraInasistencia = idCabeceraLiquidacion,
                                IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                                Documento = tmp.DNI,
                                Legajo = "NE",
                                POF = "NE",
                                POFBarra = "NE"
                            });
                        }

                        tmp.RegistroValido = "N";
                        tmp.RegistroProcesado = "S";
                        errores.Add($"Error con TMP ID {tmp.IdTMPInasistenciasDetalle}: Persona con DNI {tmp.DNI} no encontrada.");
                        continue;
                    }

                    // 2. Validar Legajo
                    if (persona.Legajo != tmp.NroLegajo?.ToString())
                    {
                        var errorYaRegistrado = await _context.MEC_TMPErroresInasistenciasDetalle
                            .AnyAsync(e =>
                                e.IdTMPInasistenciasDetalle == tmp.IdTMPInasistenciasDetalle &&
                                e.Legajo == "NE" &&
                                e.POF == "NE" &&
                                e.POFBarra == "NE");

                        if (!errorYaRegistrado)
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
                        }

                        tmp.RegistroValido = "N";
                        tmp.RegistroProcesado = "S";
                        errores.Add($"Error con TMP ID {tmp.IdTMPInasistenciasDetalle}: Legajo no coincide.");
                        continue;
                    }

                    var idPersona = persona.IdPersona;

                    // 3. Validar POF
                    var pofs = await _context.MEC_POF
                        .Where(p => p.IdEstablecimiento == idEstablecimiento && p.IdPersona == idPersona)
                        .ToListAsync();

                    if (!pofs.Any())
                    {
                        var errorYaRegistrado = await _context.MEC_TMPErroresInasistenciasDetalle
                            .AnyAsync(e =>
                                e.IdTMPInasistenciasDetalle == tmp.IdTMPInasistenciasDetalle &&
                                e.POF == "NE");

                        if (!errorYaRegistrado)
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
                        }

                        tmp.RegistroValido = "N";
                        tmp.RegistroProcesado = "S";
                        errores.Add($"Error con TMP ID {tmp.IdTMPInasistenciasDetalle}: No se encontró POF válido.");
                        continue;
                    }

                    // 4. Validar Barra
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
                        var errorYaRegistrado = await _context.MEC_TMPErroresInasistenciasDetalle
                            .AnyAsync(e =>
                                e.IdTMPInasistenciasDetalle == tmp.IdTMPInasistenciasDetalle &&
                                e.POFBarra == "NE");

                        if (!errorYaRegistrado)
                        {
                            _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                            {
                                IdCabeceraInasistencia = idCabeceraLiquidacion,
                                IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                                Documento = "OK",
                                Legajo = "OK",
                                POF = "OK",
                                POFBarra = "NE"
                            });
                        }

                        tmp.RegistroValido = "N";
                        tmp.RegistroProcesado = "S";
                        errores.Add($"Error con TMP ID {tmp.IdTMPInasistenciasDetalle}: Barra no coincide.");
                        continue;
                    }

                    // Si todo pasó correctamente
                    tmp.RegistroValido = "S";
                    tmp.RegistroProcesado = "S";
                }
                catch (Exception ex)
                {
                    errores.Add($"Error inesperado con TMP ID {tmp.IdTMPInasistenciasDetalle}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return errores.Any()
                ? $"Se encontraron errores"
                : "Todos los registros fueron procesados correctamente.";
        }


        private async Task RegistrarErrorSiNoExiste(
    MEC_TMPInasistenciasDetalle tmp,
    int idCabeceraLiquidacion,
    string documento,
    string legajo,
    string pof,
    string pofBarra)
        {
            var existeError = await _context.MEC_TMPErroresInasistenciasDetalle
                .AnyAsync(e =>
                    e.IdCabeceraInasistencia == idCabeceraLiquidacion &&
                    e.IdTMPInasistenciasDetalle == tmp.IdTMPInasistenciasDetalle &&
                    e.Documento == documento &&
                    e.Legajo == legajo &&
                    e.POF == pof &&
                    e.POFBarra == pofBarra
                );

            if (!existeError)
            {
                _context.MEC_TMPErroresInasistenciasDetalle.Add(new MEC_TMPErroresInasistenciasDetalle
                {
                    IdCabeceraInasistencia = idCabeceraLiquidacion,
                    IdTMPInasistenciasDetalle = tmp.IdTMPInasistenciasDetalle,
                    Documento = documento,
                    Legajo = legajo,
                    POF = pof,
                    POFBarra = pofBarra
                });
            }
        }




        public async Task AgregarInasistenciaAsync(int idCabeceraInasistencia,
                                                    int idPOF,
                                                    int idEstablecimiento,
                                                    int idPOFBarra,
                                                    int idTMPInasistenciasDetalle,
                                                    DateTime fecha,
                                                    int? codLicencia,
                                                    int cantHs)
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
                IdInasistenciaCabecera = idCabeceraInasistencia,
                IdEstablecimiento = idEstablecimiento,
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
                .Where(d => d.IdInasistenciaCabecera == idCabecera && string.IsNullOrEmpty(d.EstadoRegistro))
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
                .Where(d => d.IdInasistenciaCabecera == idCabecera && d.EstadoRegistro == "R")
                .ToListAsync();

            foreach (var registro in registrosRechazados)
            {
                var rechazo = new MEC_InasistenciasRechazo
                {
                    IdInasistenciaDetalle = registro.IdInasistenciasDetalle,
                    IdUsuario = usuario,
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

        //OBTIENE LOS ESTABLECIMIENTOS A LOS QUE PERTENECE EL USUARIO
        public async Task<UsuarioInfoDTO> ObtenerEstablecimientosYRolesAsync(int idUsuario)
        {
            // Ids de establecimientos vigentes
            var establecimientos = await _context.MEC_UsuariosEstablecimientos
                .Where(uxe => uxe.IdUsuario == idUsuario && uxe.Vigente == "S")
                .Select(uxe => uxe.IdEstablecimiento)
                .Distinct()
                .ToListAsync();

            // Roles del usuario
            var roles = await _context.MEC_RolesXUsuarios
                .Where(rxu => rxu.IdUsuario == idUsuario)
                .Select(rxu => rxu.Rol!.NombreRol)    // o CodRol, etc.
                .ToListAsync();

            // Devolvés el DTO
            return new UsuarioInfoDTO
            {
                IdsEstablecimientos = establecimientos,
                Roles = roles
            };
        }

        public async Task<List<InasistenciaCabeceraDTO>> ObtenerCabeceraInasistenciasAsync(int idUsuario)
        {
            var establecimientos = await _context.MEC_UsuariosEstablecimientos
       .Where(uxe => uxe.IdUsuario == idUsuario && uxe.Vigente == "S")
       .Select(uxe => uxe.IdEstablecimiento)
       .Distinct()
       .ToListAsync();

            if (!establecimientos.Any())
                return new List<InasistenciaCabeceraDTO>();

            var cabeceras = await _context.MEC_InasistenciasCabecera
                .Where(c => c.Estado != null && c.Estado.Trim().ToUpper() == "R" && establecimientos.Contains(c.IdEstablecimiento))
                .Select(c => new InasistenciaCabeceraDTO
                {
                    IdInasistenciaCabecera = c.IdInasistenciaCabecera,
                    IdEstablecimiento = c.IdEstablecimiento,
                    IdCabecera = c.IdCabecera,
                    Confecciono = c.Confecciono,
                    Mes = c.Mes,
                    Anio = c.Anio,
                    FechaApertura = c.FechaApertura,
                    FechaEntrega = c.FechaEntrega,
                    SinNovedades = c.SinNovedades,
                    Observaciones = c.Observaciones,
                    Estado = c.Estado
                })
                .ToListAsync();

            return cabeceras;
        }
        public async Task<DetalleRechazos> ObtenerDetalleYRechazosPorCabeceraAsync(int idCabecera)
        {
            // 1) Obtengo la lista de detalles para la cabecera
            var detalles = await _context.MEC_InasistenciasDetalle
                .Where(d => d.IdInasistenciaCabecera == idCabecera)
                .ToListAsync();

            // 2) Extraigo los Ids de los detalles para buscar rechazos asociados
            var detalleIds = detalles.Select(d => d.IdInasistenciasDetalle).ToList();

            // 3) Obtengo todos los rechazos asociados a esos detalles
            var rechazos = await _context.MEC_InasistenciasRechazo
                .Where(r => detalleIds.Contains(r.IdInasistenciaDetalle))
                .ToListAsync();

            // 4) Retorno ambos datos en un objeto
            return new DetalleRechazos
            {
                Detalles = detalles,
                Rechazos = rechazos
            };
        }

        //Se agregará un menú “Inasistencias” y una opción de submenú “Cargar Inasistencias”, a la que tendrán acceso los usuarios de los establecimientos.

        public async Task<List<MecanizadasDTO>> ObtenerMecanizadas(int idCabecera, int idEstablecimiento)
        {
            var mecanizadas = await _context.MEC_Mecanizadas.Where(m => m.IdCabecera == idCabecera && m.IdEstablecimiento == idEstablecimiento)
                .Select(m => new MecanizadasDTO
                {
                    IdMecanizada = m.IdMecanizada,
                    FechaConsolidacion = m.FechaConsolidacion,
                    IdUsuario = m.IdUsuario,
                    IdCabecera = m.IdCabecera,
                    MesLiquidacion = m.MesLiquidacion,
                    OrdenPago = m.OrdenPago,
                    AnioMesAfectacion = m.AnioMesAfectacion,
                    IdEstablecimiento = m.IdEstablecimiento,
                    IdPOF = m.IdPOF,
                    Importe = m.Importe,
                    Signo = m.Signo,
                    MarcaTransferido = m.MarcaTransferido,
                    Moneda = m.Moneda,
                    RegimenEstatutario = m.RegimenEstatutario,
                    Dependencia = m.Dependencia,
                    Distrito = m.Distrito,
                    Subvencion = m.Subvencion,
                    Origen = m.Origen,
                    Consolidado = m.Consolidado,
                    CodigoLiquidacion = m.CodigoLiquidacion,
                    DNI = m.POF.Persona.DNI,
                    Secuencia = m.POF.Secuencia,
                    TipoCargo = m.POF.TipoCargo,
                    Nombre = m.POF.Persona.Nombre,
                    Apellido = m.POF.Persona.Apellido
                }).ToListAsync();

            return mecanizadas;
        }

        public async Task<(bool Exito, string? Mensaje)> GuardarInasistenciaAsync(MEC_InasistenciasDetalle inasistencia)
        {

            var existe = await _context.MEC_InasistenciasDetalle
                .AnyAsync(x => x.IdPOF == inasistencia.IdPOF && x.Fecha == inasistencia.Fecha);

            if (existe)
            {
                // Ya existe, no se inserta
                return (false, "Ya existe un registro para esa POF y fecha");
            }

            inasistencia.EstadoRegistro = "P";

            _context.MEC_InasistenciasDetalle.Add(inasistencia);
            try
            {
                await _context.SaveChangesAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"Error al guardar: {ex.Message}");
            }

        }

        public async Task<List<CabeceraInasistenciaDTO>> ObtenerCabecerasInas(int idCabecera)
        {
            var idUsuario = GetUserIdFromToken();
            var usuarioInfo = await ObtenerEstablecimientosYRolesAsync(idUsuario);
            var idEst = usuarioInfo.IdsEstablecimientos;

            var cabeceras = await _context.MEC_InasistenciasCabecera.Where(i => i.IdCabecera == idCabecera && idEst.Contains(i.IdEstablecimiento) && i.Estado == "H")
                 .Select(m => new CabeceraInasistenciaDTO
                 {
                     IdInasistenciaCabecera = m.IdInasistenciaCabecera,
                     IdEstablecimiento = m.IdEstablecimiento,
                     Anio = m.Anio,
                     Mes = m.Mes,
                     Estado = m.Estado
                 }).Distinct().OrderBy(x => x.Anio).ThenBy(x => x.Mes).ToListAsync();

            return cabeceras;
        }


        public async Task<List<InasistenciasDetalleDTO>> DetalleInasistencia(int idEstablecimiento, int idInasistenciaCabecera)
        {
            var inasistencias = await _context.MEC_InasistenciasDetalle.Where(i => i.IdEstablecimiento == idEstablecimiento && idInasistenciaCabecera == idInasistenciaCabecera)
                .Select(m => new InasistenciasDetalleDTO
                {
                    DNI = m.POF.Persona.DNI,
                    NroLegajo = m.POF.Persona.Legajo,
                    Secuencia = m.POF.Secuencia,
                    Cargo = m.POF.Categoria.CodCategoriaMGP,
                    Apellido = m.POF.Persona.Apellido,
                    Nombre = m.POF.Persona.Nombre,
                    Fecha = m.Fecha,
                    CantHs = m.CantHs,
                    CantMin = m.CantMin,
                }).ToListAsync();

            return inasistencias;
        }

        public async Task<bool> EnviarInas(int idInasistenciaCabecera, string observaciones)
        {
            var idUsuario = GetUserIdFromToken();

            var cabecera = await _context.MEC_InasistenciasCabecera
                .FirstOrDefaultAsync(c => c.IdInasistenciaCabecera == idInasistenciaCabecera);

            if (cabecera == null)
                throw new KeyNotFoundException("Cabecera de inasistencia no encontrada.");

            cabecera.Observaciones = observaciones;
            cabecera.Estado = "E";
            cabecera.FechaEntrega = DateTime.Now;
            cabecera.Confecciono = idUsuario;

            bool tieneDetalles = await _context.MEC_InasistenciasDetalle.AnyAsync(d => d.IdInasistenciaCabecera == idInasistenciaCabecera);

            if (!tieneDetalles)
                cabecera.SinNovedades = "S";

            _context.MEC_InasistenciasCabecera.Update(cabecera);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<string> EliminarTMP()
        {
            try
            {
                // Usamos TRUNCATE con RESTART IDENTITY para reiniciar los IDs
                await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"MEC_TMPInasistenciasDetalle\" RESTART IDENTITY;");

                return "Tabla MEC_TMPInasistenciasDetalle truncada correctamente.";
            }
            catch (Exception ex)
            {
                // En caso de error, devolvemos el mensaje
                return $"Error al truncar la tabla: {ex.Message}";
            }
        }


        //DEVOLVER ERRORES
        public async Task<List<MEC_TMPErroresInasistenciasDetalle>> ObtenerErroresTMPAsync(
                        int idCabeceraLiquidacion,
                        int idCabeceraInasistencia,
                        string UE)
        {
            string varUE = UE.Replace("-", "");

            var errores = await _context.MEC_TMPErroresInasistenciasDetalle
                .Where(e => e.IdCabeceraInasistencia == idCabeceraLiquidacion
                            && _context.MEC_TMPInasistenciasDetalle
                                .Any(tmp => tmp.IdTMPInasistenciasDetalle == e.IdTMPInasistenciasDetalle
                                            && tmp.IdInasistenciaCabecera == idCabeceraInasistencia
                                            && tmp.UE == varUE))
                .AsNoTracking()
                .ToListAsync();

            return errores;
        }


        public async Task<List<InasEst>> RegistrosProcesados()
        {
            var listado = await (
                  from tmp in _context.MEC_TMPInasistenciasDetalle
                  join est in _context.MEC_Establecimientos
                      on tmp.UE.Replace("-", "") equals est.UE.Replace("-", "")
                  where tmp.RegistroProcesado == "S"
                  orderby tmp.UE
                  select new InasEst
                {
                    TMPDetalle = tmp,
                    IdEstablecimiento = est.IdEstablecimiento
                }
            ).ToListAsync();

            return listado;
        }
        //COMBO POF
        public async Task<PofConBarrasDTOList> BuscarPOF(string DNI, string Legajo)
        {
            var pofEntity = await _context.MEC_POF
         .Where(x => x.Persona.DNI == DNI && x.Persona.Legajo == Legajo)
         .FirstOrDefaultAsync(); // Primero traemos la entidad de la DB

            if (pofEntity == null)
                return null;

            // Luego proyectamos a DTO en memoria
            var barras = await _context.MEC_POF_Barras
        .Where(b => b.IdPOF == pofEntity.IdPOF)
        .Select(b => new ListBarraDTO
        {
            IdPOFBarra = b.IdPOFBarra,
            Barra = b.Barra
        })
        .ToListAsync();

            var pofDTO = new PofConBarrasDTOList
            {
                IdPOF = pofEntity.IdPOF,
                Apellido = pofEntity.Persona.Apellido,
                Nombre = pofEntity.Persona.Nombre,
                DNI = pofEntity.Persona.DNI,
                Legajo = pofEntity.Persona.Legajo,
                Secuencia = pofEntity.Secuencia,
                TipoCargo = pofEntity.TipoCargo,
                Vigente = pofEntity.Vigente,
                Barra = pofEntity.Barra,
                BarrasDetalle = barras
            };

            return pofDTO;
        }

    }
}