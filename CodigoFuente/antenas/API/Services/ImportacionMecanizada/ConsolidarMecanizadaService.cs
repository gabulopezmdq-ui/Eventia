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

        public async Task<List<object>> ObtenerConteosConsolidadoAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("El id de la cabecera no puede ser menor o igual a cero.");

            return await _context.MEC_Mecanizadas
                .Where(m => m.Cabecera != null && m.Cabecera.IdCabecera == idCabecera)
                .GroupBy(m => m.IdEstablecimiento)
                .Select(group => new
                {
                    IdEstablecimiento = group.Key,
                    CountConsolidadoS = group.Count(m => m.Consolidado == "S"),
                    CountConsolidadoN = group.Count(m => m.Consolidado == "N"),
                    AccionHabilitada = group.Count(m => m.Consolidado == "N") > 0
                })
                .ToListAsync<object>();
        }

        public async Task<bool> HabilitarAccionesAsync(int idEstablecimiento, string estadoCabecera)
        {
            if (string.IsNullOrWhiteSpace(estadoCabecera))
                throw new ArgumentException("El estado de la cabecera no puede ser nulo o vacío.");

            var countN = await _context.MEC_Mecanizadas
                .Where(m => m.Cabecera != null
                            && m.Cabecera.Estado == estadoCabecera
                            && m.IdEstablecimiento == idEstablecimiento
                            && m.Consolidado == "N")
                .CountAsync();

            return countN > 0;
        }

        public async Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera)
        {
            var totalRegistros = await _context.MEC_Mecanizadas
                .Where(m => m.Cabecera.IdCabecera == idCabecera)
                .CountAsync();

            var totalConsolidadoS = await _context.MEC_Mecanizadas
                .Where(m => m.Cabecera.IdCabecera == idCabecera && m.Consolidado == "S")
                .CountAsync();

            return totalRegistros > 0 && totalRegistros == totalConsolidadoS;
        }
    }
}
