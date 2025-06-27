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
        public async Task<List<MECPOFDetalleDTO>> BuscarPOFAsync(int idEstablecimiento)
        {
            return await _context.MEC_POF
                .AsNoTracking()                               // lectura sin tracking
                .Where(p => p.IdEstablecimiento == idEstablecimiento)
                .Select(p => new MECPOFDetalleDTO
                {
                    // --- datos de MEC_POF --------------------
                    IdPOF = p.IdPOF,
                    IdEstablecimiento = p.IdEstablecimiento,
                    IdPersona = p.IdPersona,
                    IdCategoria = p.IdCategoria,
                    IdCarRevista = p.IdCarRevista,
                    IdTipoFuncion = p.IdFuncion,
                    Secuencia = p.Secuencia,
                    Barra = p.Barra,
                    TipoCargo = p.TipoCargo,
                    Vigente = p.Vigente,
                    Funcion = p.TipoFuncion.CodFuncion,
                    Categoria = p.Categoria.CodCategoria,

                    // relaciones simples ----------------------
                    CarRevista = p.CarRevista.Descripcion,
                    Cargo = p.TipoFuncion.Descripcion,


                    // --- datos de Persona --------------------
                    PersonaDNI = p.Persona.DNI,
                    PersonaApellido = p.Persona.Apellido,
                    PersonaNombre = p.Persona.Nombre,
                })
                .ToListAsync();
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
            movimiento.Estado = "P";


            _context.MEC_MovimientosCabecera.Add(movimiento);
            await _context.SaveChangesAsync();

            return (true, "Registro creado correctamente.");
        }

        //Calculo de antiguedades
        public async Task<(bool Success, string Message, int? Anio, int? Mes)> CalcularAntiguedadAsync(int idMovimientoCabecera)
        {
            var movimiento = await _context.MEC_MovimientosCabecera.FindAsync(idMovimientoCabecera);

            if (movimiento == null)
                return (false, "Movimiento no encontrado.", null, null);

            var antig = await _context.MEC_POF_Antiguedades
                .AsNoTracking()
                .FirstOrDefaultAsync(); // Adaptar filtros según necesidad

            if (antig == null)
                return (false, "Registro de antigüedad no encontrado.", null, null);

            int? antigAnios = antig.AnioAntiguedad;
            int? antigMeses = antig.MesAntiguedad;

            int? mesMovimiento = movimiento.Mes;
            int? anioMovimiento = movimiento.Anio;

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
            else if (anioMovimiento > antig.AnioReferencia)
            {
                int? totalMeses = (anioMovimiento - antig.AnioReferencia) * 12 + (mesMovimiento - antig.MesReferencia);

                movimiento.Anio = antigAnios + (totalMeses / 12);
                movimiento.Mes = (antigMeses + (totalMeses % 12)) % 12;
            }
            else
            {
                return (false, "El movimiento es anterior al registro de antigüedad.", null, null);
            }

            await _context.SaveChangesAsync();

            return (true, "Cálculo exitoso.", movimiento.Anio, movimiento.Mes);
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

        public async Task MovimientoAlta(MovimientosDetalleDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cabecera = await _context.MEC_MovimientosCabecera
                    .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == dto.IdMovimientoCabecera);

                if (cabecera == null)
                    throw new Exception("Movimiento cabecera no encontrado.");

                // Actualizar cabecera
                cabecera.Observaciones = dto.Observaciones;
                cabecera.Estado = dto.Estado;
                cabecera.Fecha = DateTime.Now;

                _context.MEC_MovimientosCabecera.Update(cabecera);
                await _context.SaveChangesAsync();

                // Agregar detalle
                var detalle = new MEC_MovimientosDetalle
                {
                    IdMovimientoCabecera = cabecera.IdMovimientoCabecera,
                    IdTipoFuncion = dto.IdTipoFuncion,
                    IdPOF = dto.IdPOF,
                    IdTipoCategoria = dto.IdTipoCategoria,
                    IdMotivoBaja = dto.IdMotivoBaja,
                    TipoDoc = dto.TipoDoc,
                    TipoMovimiento = dto.TipoMovimiento,
                    NumDoc = dto.NumDoc,
                    Apellido = dto.Apellido,
                    Nombre = dto.Nombre,
                    SitRevista = dto.SitRevista,
                    Turno = dto.Turno,
                    Observaciones = dto.ObservacionDetalle,
                    AntigAnios = dto.AntigAnios,
                    AntigMeses = dto.AntigMeses,
                    Horas = dto.Horas,
                    FechaInicioBaja = dto.FechaInicioBaja,
                    FechaFinBaja = dto.FechaFinBaja
                };

                await _context.MEC_MovimientosDetalle.AddAsync(detalle);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        //detalles agrupados por cabecera

        public async Task<List<MovimientosDetalleDTO>> ObtenerDetallesPorCabeceraAsync(int idCabecera)
        {
            var detalles = await _context.MEC_MovimientosDetalle
                .Where(d => d.IdMovimientoCabecera == idCabecera)
                .Select(d => new MovimientosDetalleDTO
                {
                    IdMovimientoCabecera = d.IdMovimientoCabecera,
                    IdTipoFuncion = d.IdTipoFuncion,
                    IdPOF = d.IdPOF,
                    IdTipoCategoria = d.IdTipoCategoria,
                    IdMotivoBaja = d.IdMotivoBaja,
                    TipoDoc = d.TipoDoc,
                    TipoMovimiento = d.TipoMovimiento,
                    NumDoc = d.NumDoc,
                    Apellido = d.Apellido,
                    Nombre = d.Nombre,
                    SitRevista = d.SitRevista,
                    Turno = d.Turno,
                    Observaciones = d.Observaciones,
                    AntigAnios = d.AntigAnios,
                    AntigMeses = d.AntigMeses,
                    Horas = d.Horas,
                    FechaInicioBaja = d.FechaInicioBaja,
                    FechaFinBaja = d.FechaFinBaja
                })
                .ToListAsync();

            return detalles;
        }


        //SERVICIOS BAJAS

        //puede ser que se necesite un DTO para mejorar el rendimiento
        public async Task<List<MECPOFDetalleDTO>> ObtenerPOFPorEstablecimientoAsync(int idEstablecimiento)
        {
            var resultado = await _context.MEC_POF
         .Where(p => p.IdEstablecimiento == idEstablecimiento)
         .Select(p => new MECPOFDetalleDTO
         {
             IdPOF = p.IdPOF,
             IdEstablecimiento = p.IdEstablecimiento,
             IdPersona = p.IdPersona,
             IdCategoria = p.IdCategoria,
             IdCarRevista = p.IdCarRevista,
             Secuencia = p.Secuencia,
             Barra = p.Barra,
             TipoCargo = p.TipoCargo,
             Vigente = p.Vigente,
             CarRevista = p.CarRevista.Descripcion,
             Cargo = p.TipoFuncion.Descripcion,

             // Persona
             PersonaDNI = p.Persona.DNI,
             PersonaApellido = p.Persona.Apellido,
             PersonaNombre = p.Persona.Nombre,

         })
         .ToListAsync();

            return resultado;
        }
    }
}
