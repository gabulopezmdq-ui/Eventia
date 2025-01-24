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
                .Where(m => m.Cabecera != null
                            && m.Cabecera.IdCabecera == idCabecera);

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

            var query = _context.MEC_Mecanizadas
                .Where(m => m.Cabecera != null
                            && m.Cabecera.Estado == estadoCabecera
                            && m.IdEstablecimiento == idEstablecimiento);

            int countN = await query.CountAsync(m => m.Consolidado == "N");

            return countN > 0;
        }


        public async Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera)
        {
            if (idCabecera <= 0)
                throw new ArgumentException("El ID de la cabecera no puede ser menor o igual a cero.");

            var query = _context.MEC_Mecanizadas
                .Where(m => m.Cabecera.IdCabecera == idCabecera);

            int totalRegistros = await query.CountAsync();
            int totalConsolidadoS = await query.CountAsync(m => m.Consolidado == "S");

            return totalRegistros > 0 && totalRegistros == totalConsolidadoS;
        }

    }
}
