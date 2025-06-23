using API.DataSchema;
using API.DataSchema.DTO;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class MovimientosService : IMovimientosService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public MovimientosService(DataContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        //Busqueda de suplentes para Movimientos Bajas
        public async Task<MEC_MovimientosDetalle> BuscarSuplente(string numDoc)
        {
            if (string.IsNullOrWhiteSpace(numDoc))
                return null;

            var suplente = await _context.Set<MEC_MovimientosDetalle>()
                .AsNoTracking()
                .FirstOrDefaultAsync(md => md.NumDoc == numDoc && md.SitRevista == "21");

            if (suplente == null)
                return null;

            return new MEC_MovimientosDetalle
            {
                Apellido = suplente.Apellido,
                Nombre = suplente.Nombre
            };
        }


        //Nueva Cabecera Movimientos
        public async Task<(bool Success, string Message)> CrearMovimientoCabeceraAsync(MEC_MovimientosCabecera movimiento)
        {
            // Validar campos obligatorios
            if (movimiento.IdEstablecimiento <= 0 ||
                movimiento.Mes < 1 || movimiento.Mes > 12 ||
                movimiento.Anio < 1900 ||
                string.IsNullOrWhiteSpace(movimiento.Area))
            {
                return (false, "Debe completar todos los datos obligatorios: Establecimiento, Mes, Año y Área.");
            }

            // Validar existencia del registro para esa combinación
            var existe = await _context.MEC_MovimientosCabecera
                .AnyAsync(m => m.IdEstablecimiento == movimiento.IdEstablecimiento
                               && m.Mes == movimiento.Mes
                               && m.Anio == movimiento.Anio
                               && m.Area == movimiento.Area);

            if (existe)
            {
                return (false, "Ya existe un registro para esta combinación de Establecimiento, Mes, Año y Área.");
            }

            // Setear campos por default y valores
            movimiento.Fecha = DateTime.Now;
            movimiento.Estado = "A";


            _context.MEC_MovimientosCabecera.Add(movimiento);
            await _context.SaveChangesAsync();

            return (true, "Registro creado correctamente.");
        }

        //Calculo de antiguedades
        public async Task<bool> CalcularAntiguedadAsync(MEC_MovimientosCabecera movimiento)
        {
            if (movimiento == null)
                return false;

            // Obtener el registro de antigüedad correspondiente (esto se puede adaptar si hay que filtrar por docente)
            var antig = await _context.MEC_POF_Antiguedades
                .AsNoTracking()
                .FirstOrDefaultAsync(); // Aquí deberías filtrar según corresponda (por docente, cargo, etc.)

            if (antig == null)
                return false;

            int? antigAnios = antig.AnioAntiguedad;
            int? antigMeses = antig.MesAntiguedad;

            int? mesMovimiento = movimiento.Mes;
            int? anioMovimiento = movimiento.Anio;

            // Caso 2.1 - Mismo año
            if (anioMovimiento == antig.AnioReferencia)
            {
                int? diferenciaMeses = antigMeses + (mesMovimiento - antig.MesReferencia);

                if (diferenciaMeses >= 12)
                {
                    movimiento.Anio = antigAnios + 1;
                    movimiento.Mes = diferenciaMeses - 12;
                }
                else
                {
                    movimiento.Anio = antigAnios;
                    movimiento.Mes = diferenciaMeses;
                }
            }
            // Caso 2.2 - Año posterior
            else if (anioMovimiento > antig.AnioReferencia)
            {
                int? totalMeses = (anioMovimiento - antig.AnioReferencia) * 12 + (mesMovimiento - antig.MesReferencia);

                movimiento.Anio = antigAnios + (totalMeses / 12);
                movimiento.Mes = (antigMeses + (totalMeses % 12)) % 12;
            }
            else
            {
                // Caso no contemplado: el movimiento es anterior al registro de referencia, lo ignoramos por ahora
                return false;
            }

            return true;
        }

        //ENVIAR A PROVINCIA
        public async Task<bool> EnviarProv(MEC_MovimientosCabecera movimientos)
        {
            var movimiento = await _context.MEC_MovimientosCabecera.FindAsync(movimientos.IdMovimientoCabecera);

            if (movimiento == null)
                return false;

            movimiento.Estado = "V";
            movimiento.Fecha = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }
    }
    
}