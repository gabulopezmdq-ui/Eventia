using API.DataSchema;
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

        public CabeceraLiquidacionService(DataContext context)
        {
            _context = context;
        }

        // Método para verificar si ya existe un registro con el mismo Año, Mes y Tipo de Liquidación
        public async Task<bool> CheckIfExists(string anio, string mes, int idTipo)
        {
            return await _context.MEC_CabeceraLiquidacion
                .AnyAsync(c => c.AnioLiquidacion == anio && c.MesLiquidacion == mes && c.idTipoLiquidacion == idTipo);
        }

        // Método para crear una nueva cabecera de liquidación
        public async Task<MEC_CabeceraLiquidacion> CreateAsync(MEC_CabeceraLiquidacion cabeceraLiquidacion)
        {
            _context.MEC_CabeceraLiquidacion.Add(cabeceraLiquidacion);
            await _context.SaveChangesAsync();
            return cabeceraLiquidacion;
        }

        // Método para actualizar una cabecera de liquidación existente
        public async Task<MEC_CabeceraLiquidacion> UpdateAsync(MEC_CabeceraLiquidacion cabeceraLiquidacion)
        {
            _context.MEC_CabeceraLiquidacion.Update(cabeceraLiquidacion);
            await _context.SaveChangesAsync();
            return cabeceraLiquidacion;
        }

        // Método para eliminar una cabecera de liquidación por su ID
        public async Task DeleteAsync(int id)
        {
            var cabecera = await _context.MEC_CabeceraLiquidacion.FindAsync(id);
            if (cabecera != null)
            {
                _context.MEC_CabeceraLiquidacion.Remove(cabecera);
                await _context.SaveChangesAsync();
            }
        }

        // Método para obtener todas las cabeceras de liquidación
        public async Task<IEnumerable<MEC_CabeceraLiquidacion>> GetAllAsync()
        {
            return await _context.MEC_CabeceraLiquidacion.ToListAsync();
        }

        // Método para obtener una cabecera de liquidación por su ID
        public async Task<MEC_CabeceraLiquidacion> GetByIdAsync(int id)
        {
            return await _context.MEC_CabeceraLiquidacion.FindAsync(id);
        }
    }
}
