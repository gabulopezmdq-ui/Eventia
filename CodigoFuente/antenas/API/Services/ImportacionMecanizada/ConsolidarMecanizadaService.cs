using API.DataSchema;
using API.DataSchema.DTO;
using API.Migrations;
using API.Services.ImportacionMecanizada;
using DocumentFormat.OpenXml.Office2013.Excel;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace API.Services
{
    public class ConsolidarMecanizadaService : IConsolidarMecanizadaService
    {
        private readonly DataContext _context;

        public ConsolidarMecanizadaService(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // Obtener conteos del consolidado
        public async Task<object> ObtenerConteosConsolidadoAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("El ID de la cabecera no puede ser menor o igual a cero.");

            var query = _context.MEC_Mecanizadas
                .Where(m => m.Cabecera != null && m.Cabecera.IdCabecera == idCabecera).GroupBy(m => m.IdEstablecimiento)
                .Select(g => new
                {
                    IdEstablecimiento = g.Key,
                    CountConsolidadoS = g.Count(m => m.Consolidado == "S"),
                    CountConsolidadoN = g.Count(m => m.Consolidado == "N")
                }).ToListAsync();

            var resultado = await query;

            return new
            {
                Datos = resultado,
                AccionHabilitada = resultado.Any(r => r.CountConsolidadoN > 0)
                //(revisar si esta la funcionalida)
                //Si en cambio todos los registros de MEC_Mecanizadas para la cabecera seleccionada, 
                //tienen el campo Consolidado = “S”, entonces habilitará un botón “Cambiar Estado Cabecera” debajo de la grilla:
            };
        }

        // Verificar si se pueden habilitar acciones
        public async Task<bool> HabilitarAccionesAsync(int idEstablecimiento, string estadoCabecera)
        {
            if (string.IsNullOrWhiteSpace(estadoCabecera))
                throw new ArgumentException("El estado de la cabecera no puede ser nulo o vacío.");

            if (idEstablecimiento <= 0)
                throw new ArgumentException("El ID del establecimiento no puede ser menor o igual a cero.");

            var countN = await _context.MEC_Mecanizadas
                .Where(m => m.Cabecera.Estado == estadoCabecera && m.IdEstablecimiento == idEstablecimiento)
                .CountAsync(m => m.Consolidado == "N");

            return countN > 0;
        }

        // Verificar si se puede cambiar el estado de la cabecera
        public async Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("El ID de la cabecera no puede ser menor o igual a cero.");

            var query = _context.MEC_Mecanizadas.Where(m => m.Cabecera.IdCabecera == idCabecera);

            int totalRegistros = await query.CountAsync();
            int totalConsolidadoS = await query.CountAsync(m => m.Consolidado == "S");

            return totalRegistros > 0 && totalRegistros == totalConsolidadoS;
        }

        // Obtener registros POF que no están mecanizados
        public async Task<List<MECPOFDetalleDTO>> ObtenerRegistrosPOFNoMecanizadosAsync(int idCabecera, int idEstablecimiento)
        {
            var mecanizadasIds = await _context.MEC_Mecanizadas
                .Where(m => m.IdEstablecimiento == idEstablecimiento && m.IdCabecera == idCabecera)
                .Select(m => m.IdPOF)
                .ToListAsync();

            var result = await _context.MEC_POF
                .Where(p => p.IdEstablecimiento == idEstablecimiento && !mecanizadasIds.Contains(p.IdPOF))
                .Select(p => new MECPOFDetalleDTO
                {
                    IdPOF = p.IdPOF,
                    IdEstablecimiento = p.IdEstablecimiento,
                    IdPersona = p.IdPersona,
                    Secuencia = p.Secuencia,
                    Barra = p.Barra,
                    TipoCargo = p.TipoCargo,
                    Vigente = p.Vigente,
                    IdCategoria = p.IdCategoria,
                    IdCarRevista = p.IdCarRevista,
                    CarRevista = p.CarRevista.Descripcion,
                    Cargo = p.Categoria.CodCategoria,

                    NoSubvencionado = p.POFDetalle.Select(d => d.NoSubvencionado).FirstOrDefault(),
                    SinHaberes = p.POFDetalle.Select(d => d.SinHaberes).FirstOrDefault(),
                    CantHorasCS = p.POFDetalle.Select(d => d.CantHorasCS).FirstOrDefault(),
                    CantHorasSS = p.POFDetalle.Select(d => d.CantHorasSS).FirstOrDefault(),

                    PersonaDNI = p.Persona.DNI,
                    PersonaApellido = p.Persona.Apellido,
                    PersonaNombre = p.Persona.Nombre,

                    MecanizadaAnioAfeccion = p.Mecanizada.Select(m => m.AnioMesAfectacion).FirstOrDefault(),
                    MecanizadaMesAfeccion = p.Mecanizada.Select(m => m.MesLiquidacion).FirstOrDefault(),
                    MecanizadaCodigoLiquidacion = p.Mecanizada.Select(m => m.CodigoLiquidacion).FirstOrDefault(),
                    MecanizadaOrigen = p.Mecanizada.Select(m => m.Origen).FirstOrDefault()
                })
                .ToListAsync();

            // Ejecutamos la validación de antigüedad de manera secuencial
            foreach (var registro in result)
            {
                registro.TieneAntiguedad = await ValidarExistenciaAntiguedadAsync(registro.IdPOF);

                if (registro.TieneAntiguedad)
                {
                    var antiguedad = await _context.MEC_POF_Antiguedades.Where(a => a.IdPersona == registro.IdPersona)
                        .Select(a => new
                        {
                            a.MesReferencia,
                            a.AnioReferencia,
                            a.MesAntiguedad,
                            a.AnioAntiguedad
                        }).FirstOrDefaultAsync();

                    if (antiguedad != null)
                    {
                        registro.MesReferencia = antiguedad.MesReferencia;
                        registro.AnioReferencia = antiguedad.AnioReferencia;
                        registro.MesAntiguedad = antiguedad.MesAntiguedad;
                        registro.AnioAntiguedad = antiguedad.AnioAntiguedad;
                    }
                }
            }

            return result;
        }



        // Validar existencia de antigüedad
        public async Task<bool> ValidarExistenciaAntiguedadAsync(int idPOF)
        {
            if (idPOF <= 0)
                throw new ArgumentException("El ID del POF no puede ser menor o igual a cero.");

            // Combinando consultas para optimización
            return await _context.MEC_POF
                         .Where(p => p.IdPOF == idPOF)
                         .Join(_context.MEC_POF_Antiguedades,
                               p => p.IdPersona,
                               a => a.IdPersona,
                               (p, a) => a)
                         .AnyAsync();
        }

        // Verificar y crear antigüedad si no existe
        private async Task VerificarYCrearAntiguedadAsync(AltaMecanizadaDTO datos)
        {
            var idPersona = await _context.MEC_POF
                                          .Where(p => p.IdPOF == datos.IdPOF)
                                          .Select(p => p.IdPersona)
                                          .FirstOrDefaultAsync();

            if (idPersona == 0)
                throw new KeyNotFoundException("No se encontró una persona asociada al IdPOF.");

            // Verificar si ya existe una antigüedad para esta persona
            bool existeAntiguedad = await _context.MEC_POF_Antiguedades
                                                  .AnyAsync(a => a.IdPersona == idPersona);

            if (!existeAntiguedad)
            {
                var nuevaAntiguedad = new MEC_POF_Antiguedades
                {
                    IdPersona = idPersona,
                    MesReferencia = datos.MesReferencia,
                    AnioReferencia = datos.AnioReferencia,
                    AnioAntiguedad = datos.AnioAntiguedad,
                    MesAntiguedad = datos.MesAntiguedad
                };

                await _context.MEC_POF_Antiguedades.AddAsync(nuevaAntiguedad);
            }
        }

        // Calcular antigüedad en meses
        private int CalcularAntiguedad(int anioReferencia, int mesReferencia)
        {
            DateTime fechaReferencia = new DateTime(anioReferencia, mesReferencia, 1);
            DateTime fechaActual = DateTime.Today;
            return (fechaActual.Year - fechaReferencia.Year) * 12 + (fechaActual.Month - fechaReferencia.Month);
        }

        // Crear registro en MEC_POFDetalle
        private async Task CrearPOFDetalleAsync(AltaMecanizadaDTO datos)
        {
            var nuevoDetalle = new MEC_POFDetalle
            {
                IdCabecera = datos.IdCabecera,
                IdPOF = datos.IdPOF,
                CantHorasCS = datos.CantHorasCS,
                CantHorasSS = datos.CantHorasSS,
                AntiguedadAnios = datos.AntiguedadAnios,
                AntiguedadMeses = datos.AntiguedadMeses,
                SinHaberes = datos.SinHaberes,
                NoSubvencionado = datos.NoSubvencionado,
                SupleA = null,
            };

            await _context.MEC_POFDetalle.AddAsync(nuevoDetalle);
        }

        //Crear registro antiguedad y detalle

        public async Task CrearRegistroAntigDet(AltaMecanizadaDTO datos)
        {
            try
            {
                await CrearPOFDetalleAsync(datos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error con el detalle: {ex.Message}");
            }

            try
            {
                await VerificarYCrearAntiguedadAsync(datos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error con la antiguedad: {ex.Message}");
            }
        }

        // Crear registro en MEC_Mecanizadas
        private async Task CrearMecanizadaAsync(AltaMecanizadaDTO datos)
        {
            var nuevaMecanizada = new MEC_Mecanizadas
            {
                IdCabecera = datos.IdCabecera,
                IdEstablecimiento = datos.IdEstablecimiento,
                IdPOF = datos.IdPOF,
                MesLiquidacion = $"{datos.AnioReferencia}{datos.MesReferencia:D2}",
                AnioMesAfectacion = $"{datos.AnioReferencia % 100:D2}{datos.MesReferencia:D2}",
                Importe = 0,
                Signo = "+",
                Origen = "POF"
            };

            await _context.MEC_Mecanizadas.AddAsync(nuevaMecanizada);
        }

        // Procesar la alta mecanizada con transacción
        public async Task<bool> ProcesarAltaMecanizadaAsync(AltaMecanizadaDTO datos)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await VerificarYCrearAntiguedadAsync(datos);
                await CrearPOFDetalleAsync(datos);
                await CrearMecanizadaAsync(datos);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> EliminarRegistroMECMecanizadaAsync(int idMecanizada)
        {

            var mecanizada = await _context.MEC_Mecanizadas.FirstOrDefaultAsync(m => m.IdMecanizada == idMecanizada);

            if (mecanizada == null)
            {
                return false;
            }

            _context.MEC_Mecanizadas.Remove(mecanizada);
            await _context.SaveChangesAsync();
            await ActualizarIndicesAsync();

            return true;
        }

        private async Task ActualizarIndicesAsync()
        {

            // Usamos ExecuteSqlRawAsync para ejecutar el comando SQL directamente
            await _context.Database.ExecuteSqlRawAsync(@"
                  REINDEX TABLE ""MEC_Mecanizadas"";");
        }


        //Obtener lista de los suplentes con cargo S
        public async Task<List<SuplentesDTO>> ObtenerSuplentesAsync(int idCabecera, int idEstablecimiento)
        {
            // Paso 1: Obtener solo los IDs necesarios
            var idsPOF = await _context.MEC_Mecanizadas
                .Where(m => m.IdCabecera == idCabecera && m.IdEstablecimiento == idEstablecimiento)
                .Where(m => m.POF.CarRevista.IdCarRevista == 2)
                .Select(m => m.IdPOF)
                .Distinct()
                .ToListAsync();

            // Paso 2: Consulta optimizada en un solo DbContext
            var query = _context.MEC_POF
                .Where(pof => idsPOF.Contains(pof.IdPOF) && pof.IdCarRevista == 2)
                .Select(pof => new
                {
                    Pof = pof,
                    PrimerDetalle = pof.POFDetalle
                .Where(pd => pd.SupleDesde != null || pd.SupleHasta != null)
                .OrderBy(pd => pd.IdPOFDetalle)
                .FirstOrDefault()
                })
                .Select(x => new SuplentesDTO
                {
                    IdCabecera = idCabecera,
                    DNI = x.Pof.Persona.DNI,
                    Apellido = x.Pof.Persona.Apellido,
                    Nombre = x.Pof.Persona.Nombre,
                    Secuencia = x.Pof.Secuencia,
                    Funcion = x.Pof.TipoFuncion.CodFuncion,
                    CarRevista = x.Pof.CarRevista.CodPcia,
                    Cargo = x.Pof.TipoCargo,
                    IdPersona = x.Pof.Persona.IdPersona,
                    IdPOF = x.Pof.IdPOF,
                    IdPOFDetalle = x.Pof.POFDetalle
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => (int?)pd.IdPOFDetalle)
                        .FirstOrDefault(),
                    IdMecanizada = x.Pof.Mecanizada.Any() ? x.Pof.Mecanizada.FirstOrDefault().IdMecanizada : null,


                    // Datos de suplencia desde el primer POFDetalle relacionado
                    SupleDesde = x.Pof.POFDetalle
                        .Where(pd => pd.SupleDesde != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.SupleDesde)
                        .FirstOrDefault(),

                    SupleHasta = x.Pof.POFDetalle
                        .Where(pd => pd.SupleHasta != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.SupleHasta)
                        .FirstOrDefault(),

                    // Información del docente titular (a través de SupleA)
                    SupleA = x.Pof.POFDetalle
                        .Where(pd => pd.SupleA != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.SupleA)
                        .FirstOrDefault(),

                    SupleASecuencia = x.Pof.POFDetalle
                        .Where(pd => pd.Suplencia != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.Suplencia.Secuencia)
                        .FirstOrDefault(),

                    SupleAApellido = x.Pof.POFDetalle
                        .Where(pd => pd.Suplencia != null && pd.Suplencia.Persona != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.Suplencia.Persona.Apellido)
                        .FirstOrDefault(),

                    SupleANombre = x.Pof.POFDetalle
                        .Where(pd => pd.Suplencia != null && pd.Suplencia.Persona != null)
                        .OrderBy(pd => pd.IdPOFDetalle)
                        .Select(pd => pd.Suplencia.Persona.Nombre)
                        .FirstOrDefault(),

                    // Datos de Mecanizada
                    Importe = x.Pof.Mecanizada.FirstOrDefault().Importe,
                    CodigoLiquidacion = x.Pof.Mecanizada.FirstOrDefault().CodigoLiquidacion
                })
                .AsNoTracking();

            return await query.ToListAsync();
        }




        /*puede pasar que el metodo ObtenerSuplencesAsync genera una sobrecarga al tener varias conexiones con otras entidades.
        en ese caso se podria utilizar un metodo <dynamic> con LINQ para evitarlo o utilizar un DTO para modificar el select
        */

        //Obtener establecimientos por id
        public async Task<List<MEC_POF>> ObtenerEstablecimientoAsync(int idEstablecimiento)
        {
            if (idEstablecimiento <= 0)
                throw new ArgumentException("El ID de establecimiento debe ser mayor a cero.");

            return await _context.MEC_POF
                .Where(m => m.IdEstablecimiento == idEstablecimiento)
                .ToListAsync();
        }

        // Actualizar MEC_POFDetalle 
        public async Task ActualizarMEC_POFDetalle(int idPOF, int supleAId, int idCabecera, DateTime supleDesde, DateTime supleHasta)
        {


            // Buscar el registro correspondiente
            var detalle = await _context.MEC_POFDetalle.FirstOrDefaultAsync(d => d.IdPOF == idPOF && d.IdCabecera == idCabecera);

            if (detalle != null)
            {
                // Actualizar los campos
                detalle.SupleA = supleAId;
                detalle.SupleDesde = supleDesde;
                detalle.SupleHasta = supleHasta;

                // Guardar los cambios
                _context.Update(detalle);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new ArgumentException("No se encontró el registro con el IdPOF especificado.");
            }
        }


        // Obtener Mecanizadas

        public async Task<List<MecanizadasDTO>> ObtenerMecanizadas(int idCabecera, int idEstablecimiento)
        {
            return await _context.MEC_Mecanizadas
                .Where(m => m.IdEstablecimiento == idEstablecimiento && m.IdCabecera == idCabecera)
                .Select(p => new MecanizadasDTO
                {
                    IdMecanizada = p.IdMecanizada,
                    FechaConsolidacion = p.FechaConsolidacion,
                    IdUsuario = p.IdUsuario,
                    IdCabecera = p.IdCabecera,
                    MesLiquidacion = p.MesLiquidacion,
                    OrdenPago = p.OrdenPago,
                    AnioMesAfectacion = p.AnioMesAfectacion,
                    IdEstablecimiento = p.IdEstablecimiento,
                    IdPOF = p.IdPOF,
                    Importe = p.Importe,
                    Signo = p.Signo,
                    MarcaTransferido = p.MarcaTransferido,
                    Moneda = p.Moneda,
                    RegimenEstatutario = p.RegimenEstatutario,
                    Dependencia = p.Dependencia,
                    Distrito = p.Distrito,
                    Subvencion = p.Subvencion,
                    Origen = p.Origen,
                    Consolidado = p.Consolidado,
                    CodigoLiquidacion = p.CodigoLiquidacion,
                    DNI = p.POF.Persona.DNI,
                    Secuencia = p.POF.Secuencia,
                    TipoCargo = p.POF.TipoCargo,
                    Nombre = p.POF.Persona.Nombre,
                    Apellido = p.POF.Persona.Apellido,
                })
                .ToListAsync();
        }

        public async Task<List<object>> ObtenerPOFsSimplificadoAsync(int idEstablecimiento)
        {
            var result = await _context.MEC_POF
                .Where(p => p.IdEstablecimiento == idEstablecimiento && p.Vigente == "S")
                .Select(p => new
                {
                    p.IdPOF,
                    p.IdPersona,
                    p.Persona.Nombre,
                    p.Persona.Apellido,
                    p.Persona.DNI,
                })
                .ToListAsync();

            return result.Cast<object>().ToList();
        }


        public async Task ConsolidarRegistrosAsync(int idCabecera, int idEstablecimiento, int usuario)
        {
            if (idCabecera <= 0 || idEstablecimiento <= 0)
                throw new ArgumentException("El ID de la cabecera y el establecimiento deben ser mayores a cero.");

            // Obtener los registros de MEC_Mecanizada que coincidan con la cabecera y el establecimiento
            var registros = await _context.MEC_Mecanizadas
                .Where(m => m.IdCabecera == idCabecera && m.IdEstablecimiento == idEstablecimiento)
                .ToListAsync();

            if (!registros.Any())
                throw new InvalidOperationException("No hay registros para consolidar.");

            // Actualizar los campos requeridos
            foreach (var registro in registros)
            {
                registro.FechaConsolidacion = DateTime.Now;
                registro.IdUsuario = usuario;
                registro.Consolidado = "S";
            }

            foreach (var registro in registros)
            {
                // EJEMPLO: suponemos que cada mecanizada genera UNA retención fija.
                // Si tenés otra regla, lo cambiamos.
                var nuevaRetencion = new MEC_RetencionesXMecanizadas
                {
                    IdRetencion = 1, // Cambiá según la lógica real
                    IdMecanizada = registro.IdMecanizada,
                    IdEstablecimiento = idEstablecimiento,
                    Importe = 0m // Cambiar según cálculo real
                };

                _context.MEC_RetencionesXMecanizadas.Add(nuevaRetencion);
            }

            // Guardar los cambios en la base de datos
            await _context.SaveChangesAsync();
        }

        public async Task CambiarEstadoCabeceraAsync(int idCabecera, int usuario)
        {
            var cabecera = await _context.MEC_CabeceraLiquidacion
                .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera == null)
                throw new Exception("Cabecera no encontrada");

            // Cambiar estado
            cabecera.Estado = "S";

            // Registrar cambio en MEC_CabeceraLiquidacionEstados
            var nuevoEstado = new MEC_CabeceraLiquidacionEstados
            {
                IdCabecera = idCabecera,
                FechaCambioEstado = DateTime.Today,
                IdUsuario = usuario,
                Estado = "S"
            };

            _context.MEC_CabeceraLiquidacionEstados.Add(nuevoEstado);

            await _context.SaveChangesAsync();
        }

        public async Task<MecReporteRespuestaDTO> ObtenerReporte(int idCabecera, int idEstablecimiento)
        {
            var mecanizadas = await _context.MEC_Mecanizadas
                .AsNoTracking()
                .Where(m => m.IdEstablecimiento == idEstablecimiento && m.IdCabecera == idCabecera)
                .Select(p => new MecanizadasDTO
                {
                    IdMecanizada = p.IdMecanizada,
                    FechaConsolidacion = p.FechaConsolidacion,
                    IdUsuario = p.IdUsuario,
                    IdCabecera = p.IdCabecera,
                    MesLiquidacion = p.MesLiquidacion,
                    OrdenPago = p.OrdenPago,
                    AnioMesAfectacion = p.AnioMesAfectacion,
                    IdEstablecimiento = p.IdEstablecimiento,
                    IdPOF = p.IdPOF,
                    Importe = p.Importe,
                    Signo = p.Signo,
                    MarcaTransferido = p.MarcaTransferido,
                    Moneda = p.Moneda,
                    RegimenEstatutario = p.RegimenEstatutario,
                    Dependencia = p.Dependencia,
                    Distrito = p.Distrito,
                    Subvencion = p.Subvencion,
                    Origen = p.Origen,
                    Consolidado = p.Consolidado,
                    CodigoLiquidacion = p.CodigoLiquidacion,
                    DNI = p.POF.Persona.DNI,
                    Secuencia = p.POF.Secuencia,
                    TipoCargo = p.POF.TipoCargo,
                    Nombre = p.POF.Persona.Nombre,
                    Apellido = p.POF.Persona.Apellido
                })
                .ToListAsync();

            // ✅ Precargas MASIVAS corregidas (SIN duplicados)
            var establecimientos = await _context.MEC_Establecimientos.AsNoTracking()
                .ToDictionaryAsync(x => x.IdEstablecimiento);

            var tiposEst = await _context.MEC_TiposEstablecimientos.AsNoTracking()
                .ToDictionaryAsync(x => x.IdTipoEstablecimiento);

            var pofs = await _context.MEC_POF.AsNoTracking()
                .GroupBy(x => x.IdPOF)
                .Select(g => g.First())
                .ToDictionaryAsync(x => x.IdPOF);

            var carRevistas = await _context.MEC_CarRevista.AsNoTracking()
                .GroupBy(x => x.IdCarRevista)
                .Select(g => g.First())
                .ToDictionaryAsync(x => x.IdCarRevista);

            var tiposFunciones = await _context.MEC_TiposFunciones.AsNoTracking()
                .GroupBy(x => x.IdTipoFuncion)
                .Select(g => g.First())
                .ToDictionaryAsync(x => x.IdTipoFuncion);

            var pofDetalle = await _context.MEC_POFDetalle.AsNoTracking()
                .GroupBy(x => x.IdPOF)
                .Select(g => g.First())
                .ToDictionaryAsync(x => x.IdPOF);

            var antiguedades = await _context.MEC_POF_Antiguedades.AsNoTracking()
                .GroupBy(x => x.IdPersona)
                .Select(g => g.First())
                .ToDictionaryAsync(x => x.IdPersona);

            var categorias = await _context.MEC_TiposCategorias.AsNoTracking()
                .ToDictionaryAsync(x => x.IdTipoCategoria);

            var conceptos = await _context.MEC_Conceptos.AsNoTracking()
                .ToDictionaryAsync(x => x.CodConcepto.Trim());

            var lista = new List<MecReporte>();

            foreach (var dto in mecanizadas)
            {
                if (!establecimientos.TryGetValue(dto.IdEstablecimiento, out var est))
                    throw new Exception($"Establecimiento no encontrado: {dto.IdEstablecimiento}");

                if (!pofs.TryGetValue(dto.IdPOF.Value, out var pof))
                    throw new Exception($"POF no encontrado: {dto.IdPOF}");

                if (!tiposEst.TryGetValue(est.IdTipoEstablecimiento, out var tipoEst))
                    throw new Exception($"TipoEstablecimiento no encontrado: {est.IdTipoEstablecimiento}");

                if (!carRevistas.TryGetValue(pof.IdCarRevista, out var carRevista))
                    throw new Exception($"CarRevista no encontrado: {pof.IdCarRevista}");

                if (!tiposFunciones.TryGetValue(pof.IdFuncion, out var tipoFuncion))
                    throw new Exception($"TipoFuncion no encontrada: {pof.IdFuncion}");

                antiguedades.TryGetValue(pof.IdPersona, out var antiguedad);
                antiguedad ??= new MEC_POF_Antiguedades { MesAntiguedad = 0, AnioAntiguedad = 0 };

                pofDetalle.TryGetValue(pof.IdPOF, out var horasCs);
                horasCs ??= new MEC_POFDetalle { CantHorasCS = 0 };

                if (!categorias.TryGetValue(pof.IdCategoria, out var categoria))
                    throw new Exception($"Categoria no encontrada: {pof.IdCategoria}");

                var codigoLimpio = dto.CodigoLiquidacion?.Trim();
                conceptos.TryGetValue(codigoLimpio ?? "", out var concepto);

                lista.Add(new MecReporte
                {
                    DTO = dto,
                    OrdenPago = dto.OrdenPago,
                    NroDiegep = est.NroDiegep,
                    NombrePcia = est.NombrePcia,
                    Subvencion = est.Subvencion,
                    CantTurnos = est.CantTurnos,
                    CantSecciones = est.CantSecciones,
                    Ruralidad = est.Ruralidad,
                    TipoEst = tipoEst.CodTipoEstablecimiento,
                    TipoEstDesc = tipoEst.Descripcion,
                    CarRevista = carRevista.CodPcia,
                    TipoFuncion = tipoFuncion.CodFuncion,
                    Categoria = categoria.CodCategoria,
                    CantHsCs = horasCs.CantHorasCS,
                    MesAntiguedad = antiguedad.MesAntiguedad,
                    AnioAntiguedad = antiguedad.AnioAntiguedad,
                    AnioMesAfectacion = dto.AnioMesAfectacion,
                    CodigoLiquidacionNumero = codigoLimpio ?? "",
                    CodigoLiquidacionDescripcion = concepto?.Descripcion ?? "",
                    Importe = dto.Importe,
                    Signo = dto.Signo ?? "+",
                    SinSubvencion = horasCs?.NoSubvencionado ?? "",
                    SinHaberes = horasCs?.SinHaberes ?? "",
                });
            }
            var listaDepurada = lista
                    .Where(x =>
                    {
                        if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                            return true;

                        if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var concepto))
                            return true;

                        return concepto.Patronal != "S";
                    })
                     .GroupBy(x => new { x.DTO.DNI, x.DTO.Secuencia, x.AnioMesAfectacion, x.CodigoLiquidacionNumero })
                        .Select(g => g.First())
                        .ToList();

            var importeNetoTotal = lista.Sum(x =>
            {
                var importe = x.Importe ?? 0;
                var signo = x.Signo ?? "+";
                return signo == "-" ? -importe : importe;
            });

            var totalPersonas = lista
                        .Select(x => x.DTO.DNI)
                        .Distinct()
                        .Count();

            var totalConAporte = lista
                            .Where(x =>
                            {
                                if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                    return false;

                                if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                    return false;

                                return conc.ConAporte == "S";
                            })
                            .Sum(i =>
                            {
                                var importe = i.Importe ?? 0;
                                var signo = i.Signo ?? "+";
                                return signo == "-" ? -importe : importe;
                            });


            var totalSinAporte = lista
                            .Where(x =>
                            {
                                if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                    return false;

                                if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                    return false;

                                return conc.ConAporte == "N";
                            })
                            .Sum(i =>
                            {
                                var importe = i.Importe ?? 0;
                                var signo = i.Signo ?? "+";
                                return signo == "-" ? -importe : importe;
                            });

        

            var totalSalario = lista
                .Where(x =>
                {
                    if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                        return false;

                    if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                        return false;

                    return conc.CodConcepto == "2050";
                })
                .Sum(i =>
                {
                    var importe = i.Importe ?? 0;
                    var signo = i.Signo ?? "+";
                    return signo == "-" ? -importe : importe;
                });

            //salaria familiar + s/aportes no salario
            var totalSinAportesEnPesos = totalSalario + totalSinAporte;

            var totalIps = lista // patronal 16%
                .Where(x =>
                {
                    if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                        return false;

                    if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                        return false;

                    return conc.CodConcepto == "1060";
                })
                .Sum(i =>
                {
                    var importe = i.Importe ?? 0;
                    var signo = i.Signo ?? "+";
                    return signo == "-" ? -importe : importe;
                });

            var totalIpsPatronal = lista // patronal 12%
                            .Where(x =>
                            {
                                if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                    return false;

                                if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                    return false;

                                return conc.CodConcepto == "3060"; // IPS Patronal
                            })
                            .Sum(i =>
                            {
                                var importe = i.Importe ?? 0;
                                var signo = i.Signo ?? "+";
                                return signo == "-" ? -importe : importe;
                            });

            var totalIpsSac = lista
                            .Where(x =>
                            {
                                if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                    return false;

                                if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                    return false;

                                return conc.CodConcepto == "1069"; // IPS del SAC
                            })
                            .Sum(i =>
                            {
                                var importe = i.Importe ?? 0;
                                var signo = i.Signo ?? "+";
                                return signo == "-" ? -importe : importe;
                            });

            var totalIpsGeneral = totalIps + totalIpsPatronal + totalIpsSac;

            var totalesGlobales = lista
                         .Where(x => !string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                         .GroupBy(x => x.CodigoLiquidacionNumero)
                         .Select(g =>
                         {
                             var suma = g.Sum(i =>
                             {
                                 var importe = i.Importe ?? 0;
                                 var signo = i.Signo ?? "+";
                                 return signo == "-" ? -importe : importe;
                             });

                             conceptos.TryGetValue(g.Key, out var concepto);

                             return new CodigoLiquidacionDTO
                             {
                                 Codigo = g.Key,
                                 Descripcion = concepto?.Descripcion ?? "",
                                 Importe = suma,
                                 Signo = suma < 0 ? "-" : "+",  
                                 Patronal = concepto?.Patronal,
                                 ConAporte = concepto?.ConAporte
                             };
                         })
                         .ToList();


            var totalOSPatronal = lista
                        .Where(x =>
                        {
                            if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                return false;

                            if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                return false;

                            return conc.CodConcepto == "3285";
                        })
                        .Sum(i =>
                        {
                            var importe = i.Importe ?? 0;
                            var signo = i.Signo ?? "+";
                            return signo == "-" ? -importe : importe;
                        });

            var totalOSPersonal = lista
                        .Where(x =>
                        {
                            if (string.IsNullOrWhiteSpace(x.CodigoLiquidacionNumero))
                                return false;

                            if (!conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc))
                                return false;

                            return conc.CodConcepto == "1285";
                        })
                        .Sum(i =>
                        {
                            var importe = i.Importe ?? 0;
                            var signo = i.Signo ?? "+";
                            return signo == "-" ? -importe : importe;
                        });

            var totalOSGeneral = totalOSPersonal + totalOSPatronal;

            var agrupados = listaDepurada
                    .GroupBy(x => new
                    {
                        x.DTO.DNI,
                        x.DTO.Secuencia,
                        x.AnioMesAfectacion
                    })
                    .Select(g => new MecReportePersona
                    {
                        DNI = g.Key.DNI,
                        Secuencia = g.Key.Secuencia,
                        AnioMesAfectacion = g.Key.AnioMesAfectacion,

                        Nombre = g.First().DTO.Nombre,
                        Apellido = g.First().DTO.Apellido,
                        Categoria = g.First().Categoria,
                        CantHsCs = g.First().CantHsCs,
                        MesAntiguedad = g.First().MesAntiguedad,
                        AnioAntiguedad = g.First().AnioAntiguedad,
                        TipoFuncion = g.First().TipoFuncion,
                        CarRevista = g.First().CarRevista,
                        NroDiegep = g.First().NroDiegep,
                        NombrePcia = g.First().NombrePcia,
                        Subvencion = g.First().Subvencion,
                        CantTurnos = g.First().CantTurnos,
                        CantSecciones = g.First().CantSecciones,
                        Ruralidad = g.First().Ruralidad,
                        TipoEst = g.First().TipoEst,
                        TipoEstDesc = g.First().TipoEstDesc,
                        SinHaberes = g.First().SinHaberes,
                        SinSubvencion = g.First().SinSubvencion,

                        CodigosLiquidacionDetallados = g
                            .Select(x =>
                            {
                                conceptos.TryGetValue(x.CodigoLiquidacionNumero, out var conc);
                                return new CodigoLiquidacionDTO
                                {
                                    Codigo = x.CodigoLiquidacionNumero,
                                    Descripcion = x.CodigoLiquidacionDescripcion,
                                    Importe = x.Importe ?? 0,
                                    Signo = x.Signo,
                                    Patronal = conc?.Patronal,
                                    ConAporte = conc?.ConAporte
                                };
                            })
                            .ToList(),

                        Neto = g.Sum(i =>
                        {
                            var importe = i.Importe ?? 0;
                            var signo = i.Signo ?? "+";
                            return signo == "-" ? -importe : importe;
                        })
                    })
                    .OrderBy(x => x.DNI)
                    .ThenBy(x => x.AnioMesAfectacion)
                    .ToList();

            return new MecReporteRespuestaDTO
            {
                Personas = agrupados,
                TotalesPorConcepto = totalesGlobales,
                TotalPersonas = totalPersonas,
                TotalConAporte = totalConAporte,
                TotalSinAporte = totalSinAporte,
                TotalSalario = totalSalario,
                TotalIps = totalIps,
                OSPatronal = totalOSPatronal,
                OSPersonal = totalOSPersonal,
                ImporteNeto = importeNetoTotal,
                TotalSinAportesEnPesos = totalSinAportesEnPesos,
                TotalIpsPatronal = totalIpsPatronal,
                TotalIpsSac = totalIpsSac,
                TotalDescuentos = totalIpsGeneral,
                TotalOSGeneral = totalOSGeneral
            };
        }

        public async Task<List<RetencionDTO>> ObtenerRetencionesDTOAsync(int idEstablecimiento, int idMecanizada)
        {
            return await _context.MEC_RetencionesXMecanizadas
                .Where(x => x.IdEstablecimiento == idEstablecimiento
                         && x.IdMecanizada == idMecanizada)
                .Include(x => x.Retencion)
                .Select(x => new RetencionDTO
                {
                    IdRetencionXMecanizada = x.IdRetencionXMecanizada,
                    IdRetencion = x.IdRetencion,
                    Descripcion = x.Retencion.Descripcion,
                    Importe = x.Importe
                })
                .ToListAsync();
        }

        public async Task DesconsolidarAsync(int idCabecera, int idEstablecimiento)
        {
            if (idCabecera <= 0 || idEstablecimiento <= 0)
                throw new ArgumentException("Parámetros inválidos.");

            var registros = await _context.MEC_Mecanizadas
                .Where(x => x.IdCabecera == idCabecera
                         && x.IdEstablecimiento == idEstablecimiento
                         && x.Consolidado == "S")
                .ToListAsync();

            if (!registros.Any())
                return;

            foreach (var r in registros)
            {
                r.Consolidado = "N";
                r.FechaConsolidacion = null;
                r.IdUsuario = null;
            }

            await _context.SaveChangesAsync();
        }
    }
}
