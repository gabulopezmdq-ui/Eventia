using API.DataSchema;
using API.DataSchema.DTO;
using API.Services.ImportacionMecanizada;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
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
                .Select(g => new {
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
            // Obtenemos los IdPOF que ya existen en la tabla MEC_Mecanizadas para el IdEstablecimiento y IdCabecera seleccionados
            var mecanizadasIds = await _context.MEC_Mecanizadas
                .Where(m => m.IdEstablecimiento == idEstablecimiento && m.IdCabecera == idCabecera)
                .Select(m => m.IdPOF)
                .ToListAsync();

            // Realizamos la consulta incluyendo la información adicional de las entidades relacionadas
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

                    // Incluir la información de la persona relacionada (MEC_Personas)
                    PersonaDNI = p.Persona.DNI,
                    PersonaApellido = p.Persona.Apellido,
                    PersonaNombre = p.Persona.Nombre,

                    // Incluir la información de MEC_Mecanizadas (si está relacionada con el POF)
                    MecanizadaAnioAfeccion = p.Mecanizada.Select(m => m.AnioMesAfectacion).FirstOrDefault(),
                    MecanizadaMesAfeccion = p.Mecanizada.Select(m => m.MesLiquidacion).FirstOrDefault(),
                    MecanizadaCodigoLiquidacion = p.Mecanizada.Select(m => m.CodigoLiquidacion).FirstOrDefault(),
                    MecanizadaOrigen = p.Mecanizada.Select(m => m.Origen).FirstOrDefault()
                })
                .ToListAsync();

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
                NoSubvencionado = datos.NoSubvencionado
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
                MesLiquidacion = $"{datos.AnioAfectacion}{datos.MesAfectacion:D2}",
                AnioMesAfectacion = $"{datos.AnioAfectacion % 100}{datos.MesAfectacion:D2}",
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
        public async Task<List<MEC_Mecanizadas>> ObtenerSuplentesAsync(int idCabecera, int idEstablecimiento)
        {
            if (idCabecera <= 0 || idEstablecimiento <= 0)
                throw new ArgumentException("El ID de la cabecera y el ID del establecimiento deben ser mayores a cero.");

            return await _context.MEC_Mecanizadas
                .Where(m => m.IdCabecera == idCabecera
                            && m.IdEstablecimiento == idEstablecimiento
                            && _context.MEC_POF
                                .Any(p => p.IdPOF == m.IdPOF && p.CarRevista.CodPcia == "S"))
                .ToListAsync();
        }
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
        public async Task ActualizarMEC_POFDetalle(MEC_POFDetalle alta, int idCabecera, DateTime? desde, DateTime? hasta)
        {
            if (desde == DateTime.MinValue || hasta == DateTime.MinValue)
            {
                throw new ArgumentException("Las fechas de suplencia no pueden ser valores predeterminados.");
            }

            alta.IdCabecera = idCabecera;
            alta.SupleDesde = desde ?? null;
            alta.SupleHasta = hasta ?? null;

            _context.Add(alta);
            await _context.SaveChangesAsync();
        }


    }
}
