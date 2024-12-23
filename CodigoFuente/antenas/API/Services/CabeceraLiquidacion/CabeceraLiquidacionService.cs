using API.DataSchema;
using API.Migrations;
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

        public async Task<string> AddCabecera(MEC_CabeceraLiquidacion cabecera, MEC_CabeceraLiquidacionEstados cab, MEC_BajasCabecera baja, MEC_InasistenciasCabecera obj)
        {
            bool check = await CheckIfExists(cabecera.AnioLiquidacion, cabecera.MesLiquidacion, cabecera.idTipoLiquidacion);
            if (check)
            {
                throw new InvalidOperationException("Ya existe una Cabecera de Liquidación para el Mes/Año y Tipo de Liquidación.");
            }
            else
            {
                // Guardamos la cabecera y obtenemos el idCabecera
                await SetLiqui(cabecera);

                // Guardamos el estado de la cabecera
                await SeEstados(cab);

                // Ahora asignamos el idCabecera a las entidades relacionadas y las guardamos
                if (cabecera.CalculaBajas == "s")
                {
                    await SetEstablecimientoXCabeceraLiquidacion(baja, cabecera.IdCabecera);
                }
                else if (cabecera.CalculaInasistencias == "s")
                {
                    await SetInasistenciaXCabeceraLiquidacion(obj, cabecera.IdCabecera, cabecera.MesLiquidacion, cabecera.AnioLiquidacion);
                }
            }
            return "Cabecera agregada";
        }

        // Método para guardar la cabecera
        public async Task SetLiqui(MEC_CabeceraLiquidacion cab)
        {
            cab.Estado = "P";
            cab.Vigente = "S";

            _context.AddRange(cab);
            await _context.SaveChangesAsync();  // Guardamos la cabecera para obtener el IdCabecera
        }

        // Método para guardar el estado de la cabecera
        public async Task SeEstados(MEC_CabeceraLiquidacionEstados cab)
        {
            cab.Estado = "P";
            cab.FechaCambioEstado = DateTime.Now;

            _context.AddRange(cab);
            await _context.SaveChangesAsync();
        }

        // Método para guardar las bajas asociadas a la cabecera
        public async Task SetEstablecimientoXCabeceraLiquidacion(MEC_BajasCabecera baja, int idCabecera)
        {
            baja.IdCabecera = idCabecera;  // Asignamos el idCabecera a la baja
            baja.FechaApertura = DateTime.Now;
            baja.Usuario=baja.Usuario;//cambiar
            baja.Estado = "P";
            baja.SinNovedades = "N";

            _context.AddRange(baja);
            await _context.SaveChangesAsync();
        }

        // Método para guardar las inasistencias asociadas a la cabecera
        public async Task SetInasistenciaXCabeceraLiquidacion(MEC_InasistenciasCabecera obj, int idCabecera, string MesLiquidacion, string AnioLiquidacion)
        {
            obj.IdCabecera = idCabecera;  // Asignamos el idCabecera a la inasistencia
            obj.Estado = "P";
            obj.Mes = int.Parse(MesLiquidacion);
            obj.Anio = int.Parse(AnioLiquidacion);
            obj.FechaApertura = DateTime.Now;
            obj.SinNovedades = "N";

            _context.AddRange(obj);
            await _context.SaveChangesAsync();
        }
    }
}