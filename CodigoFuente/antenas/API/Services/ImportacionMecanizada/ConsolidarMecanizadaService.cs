using API.DataSchema;
using API.DataSchema.DTO;
using API.Services.ImportacionMecanizada;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<object> ObtenerConteosConsolidadoAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("Los IDs no pueden ser menores o iguales a cero.");

            var query = _context.MEC_Mecanizadas
                .Where(m => m.Cabecera != null && m.Cabecera.IdCabecera == idCabecera);

            int countS = await query.CountAsync(m => m.Consolidado == "S");
            int countN = await query.CountAsync(m => m.Consolidado == "N");

            return new
            {
                CountConsolidadoS = countS,
                CountConsolidadoN = countN,
                AccionHabilitada = countN > 0
            };
        }

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

        public async Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("El ID de la cabecera no puede ser menor o igual a cero.");

            var query = _context.MEC_Mecanizadas.Where(m => m.Cabecera.IdCabecera == idCabecera);

            int totalRegistros = await query.CountAsync();
            int totalConsolidadoS = await query.CountAsync(m => m.Consolidado == "S");

            return totalRegistros > 0 && totalRegistros == totalConsolidadoS;
        }

        public async Task<List<MEC_POF>> ObtenerRegistrosPOFNoMecanizadosAsync(int idCabecera, int idEstablecimiento)
        {
            if (idCabecera <= 0 || idEstablecimiento <= 0)
                throw new ArgumentException("Los IDs no pueden ser menores o iguales a cero.");

            return await _context.MEC_POF
                .Where(p => p.IdEstablecimiento == idEstablecimiento &&
                            !_context.MEC_Mecanizadas.Any(m => m.IdPOF == p.IdPOF &&
                                                                m.IdEstablecimiento == idEstablecimiento &&
                                                                m.IdCabecera == idCabecera))
                .ToListAsync();
        }

        // Validar existencia de antigüedad
        public async Task<bool> ValidarExistenciaAntiguedadAsync(int idPOF)
        {
            if (idPOF <= 0)
                throw new ArgumentException("El ID del POF no puede ser menor o igual a cero.");

            return await _context.MEC_POF_Antiguedades.AnyAsync(a => a.IdPOF == idPOF);
        }

        // Crear registro en MEC_POF_Antiguedades si no existe
        private async Task CrearAntiguedadAsync(AltaMecanizadaDTO datos)
        {
            var nuevaAntiguedad = new MEC_POF_Antiguedades
            {
                IdPOF = datos.IdPOF,
                MesReferencia = datos.MesReferencia,
                AnioReferencia = datos.AnioReferencia,
                AnioAntiguedad = datos.AnioAntiguedad,
                MesAntiguedad = datos.MesAntiguedad
            };

            await _context.MEC_POF_Antiguedades.AddAsync(nuevaAntiguedad);
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
                bool existeAntiguedad = await ValidarExistenciaAntiguedadAsync(datos.IdPOF);

                if (!existeAntiguedad)
                    await CrearAntiguedadAsync(datos);

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
    }
}
