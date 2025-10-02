using API.DataSchema;
using API.DataSchema.DTO;
using API.Migrations;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static API.DataSchema.DTO.ReporteMovDTO;

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

        public async Task AddCabeceraFecha(MEC_MovimientosCabecera entity)
        {
                entity.Fecha = DateTime.Now;

            _context.MEC_MovimientosCabecera.Add(entity);
            await _context.SaveChangesAsync();
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
                .AsNoTracking()                              
                .Where(p => p.IdEstablecimiento == idEstablecimiento)
                .Select(p => new MECPOFDetalleDTO
                {
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

                    CarRevista = p.CarRevista.Descripcion,
                    Cargo = p.TipoFuncion.Descripcion,
                    AnioAntiguedad = p.Persona.POFAntiguedad.Select(a => a.AnioAntiguedad).FirstOrDefault(),
                    MesAntiguedad = p.Persona.POFAntiguedad.Select(a => a.MesAntiguedad).FirstOrDefault(),


                    PersonaDNI = p.Persona.DNI,
                    PersonaApellido = p.Persona.Apellido,
                    PersonaNombre = p.Persona.Nombre,
                })
                .ToListAsync();
        }



        //Nueva Cabecera Movimientos
        public async Task<(bool Success, string Message, int? IdMovimientoCabecera)>
        CrearMovimientoCabeceraAsync(MEC_MovimientosCabecera movimiento)
        {
            if (movimiento.IdEstablecimiento <= 0 ||
                movimiento.Mes is < 1 or > 12 ||
                movimiento.Anio < 1900 ||
                string.IsNullOrWhiteSpace(movimiento.Area))
            {
                return (false, "Debe completar todos los campos obligatorios.", null);
            }

            var existe = await _context.MEC_MovimientosCabecera.AnyAsync(m =>
                m.IdEstablecimiento == movimiento.IdEstablecimiento &&
                m.Mes == movimiento.Mes &&
                m.Anio == movimiento.Anio &&
                m.Area == movimiento.Area);

            if (existe)
            {
                return (false, "Ya existe un registro para esta combinación.", null);
            }

            movimiento.Fecha = DateTime.Now;
            movimiento.Estado = "P";

            _context.MEC_MovimientosCabecera.Add(movimiento);
            await _context.SaveChangesAsync();

            return (true, "Registro creado correctamente.", movimiento.IdMovimientoCabecera);
        }



        //Calculo de antiguedades
        public async Task<(bool Success, string Message, int? Anio, int? Mes)> CalcularAntiguedadAsync(int idMovimientoCabecera)
        {
            var movimiento = await _context.MEC_MovimientosCabecera.FindAsync(idMovimientoCabecera);

            if (movimiento == null)
                return (false, "Movimiento no encontrado.", null, null);

            var antig = await _context.MEC_POF_Antiguedades
                .AsNoTracking()
                .FirstOrDefaultAsync(); 

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

        //ENVIAR A EDUCACION
        public async Task<bool> EnviarEduc(MEC_MovimientosCabecera movimientos)
        {
            var movimiento = await _context.MEC_MovimientosCabecera.FindAsync(movimientos.IdMovimientoCabecera);

            if (movimiento == null)
                return false;

            movimiento.Estado = "E";

            await _context.SaveChangesAsync();

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

        public async Task MovimientoAlta(MovimientosDetalleDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cabecera = await _context.MEC_MovimientosCabecera
                    .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == dto.IdMovimientoCabecera);

                if (cabecera == null)
                    throw new Exception("Movimiento cabecera no encontrado.");

                cabecera.Observaciones = dto.Observaciones;
                cabecera.Estado = dto.Estado;
                cabecera.Fecha = DateTime.Now;

                await _context.SaveChangesAsync();

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
                    FechaFinBaja = dto.FechaFinBaja,
                };

                await _context.MEC_MovimientosDetalle.AddAsync(detalle);
                await _context.SaveChangesAsync();

                await ActualizarApellidosCabeceraAsync(cabecera.IdMovimientoCabecera);

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
            var usuarioId = GetUserIdFromToken();
            var usuario = _context.MEC_Usuarios.FirstOrDefault(u => u.IdUsuario == usuarioId);
            var detalles = await _context.MEC_MovimientosDetalle
                .Where(d => d.IdMovimientoCabecera == idCabecera)
                .Select(d => new MovimientosDetalleDTO
                {
                    IdMovimientoCabecera = d.IdMovimientoCabecera,
                    IdMovimientoDetalle = d.IdMovimientoDetalle,
                    IdTipoFuncion = d.IdTipoFuncion,
                    IdPOF = d.IdPOF ?? null,
                    IdTipoCategoria = d.IdTipoCategoria,
                    IdMotivoBaja = d.IdMotivoBaja ?? null,
                    TipoDoc = d.TipoDoc,
                    TipoMovimiento = d.TipoMovimiento,
                    NumDoc = d.NumDoc,
                    Apellido = d.Apellido,
                    Nombre = d.Nombre,
                    SitRevista = d.SitRevista,
                    Turno = d.Turno,
                    Observaciones = d.Observaciones,
                    AntigAnios = d.AntigAnios ?? null,
                    AntigMeses = d.AntigMeses ?? null,
                    Horas = d.Horas,
                    FechaInicioBaja = d.FechaInicioBaja ?? null,
                    FechaFinBaja = d.FechaFinBaja ?? null,
                    Decrece = d.Decrece,
                    HorasDecrece = d.HorasDecrece,
                    Usuario = usuario.Nombre,
                })
                .ToListAsync();

            return detalles;
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

        //ARMAR REPORTE
        public async Task<ReporteEstablecimientoDTO?> Reporte(int idMovimientoCabecera)
        {
            var cabecera = await _context.MEC_MovimientosCabecera
                .AsNoTracking()
                .Where(c => c.IdMovimientoCabecera == idMovimientoCabecera)
                .Select(c => new ReporteEstablecimientoDTO
                {
                    IdEstablecimiento = c.IdEstablecimiento,
                    NroDiegep = c.Establecimientos.NroDiegep,
                    IdTipoEstablecimiento = c.Establecimientos.IdTipoEstablecimiento,
                    NroEstablecimiento = c.Establecimientos.NroEstablecimiento,
                    NombreMgp = c.Establecimientos.NombreMgp,
                    NombrePcia = c.Establecimientos.NombrePcia,
                    Ruralidad = c.Establecimientos.Ruralidad,
                    Subvencion = c.Establecimientos.Subvencion,
                    Mes = c.Mes,
                    Anio = c.Anio,
                    Area = c.Area
                })
                .FirstOrDefaultAsync();

            if (cabecera is null) return null;

            cabecera.Docentes = await _context.MEC_MovimientosDetalle
                .AsNoTracking()
                .Where(d => d.IdMovimientoCabecera == idMovimientoCabecera)
                .Select(d => new ReporteDocenteDTO
                {
                    IdMovimientoDetalle = d.IdMovimientoDetalle,

                    NumDoc = d.NumDoc,
                    Apellido = d.Apellido,
                    Nombre = d.Nombre,
                    SitRevista = d.SitRevista,
                    Turno = d.Turno,
                    Observaciones = d.Observaciones,
                    AntigAnios = d.AntigAnios ?? null,
                    AntigMeses = d.AntigMeses ?? null,
                    Horas = d.Horas,

                    Secuencia = _context.MEC_POF
                                 .Where(p => p.IdPOF == d.IdPOF)
                                 .Select(p => p.Secuencia)
                                 .FirstOrDefault(),

                    Categoria = _context.MEC_TiposCategorias
                                 .Where(tc => tc.IdTipoCategoria == d.IdTipoCategoria)
                                 .Select(tc => tc.CodCategoria)
                                 .FirstOrDefault(),

                    Funcion = _context.MEC_TiposFunciones
                                 .Where(tf => tf.IdTipoFuncion == d.IdTipoFuncion)
                                 .Select(tf => tf.CodFuncion)
                                 .FirstOrDefault(),

                    TipoMovimiento = d.TipoMovimiento,
                    TipoDoc = d.TipoDoc
                })
                .ToListAsync();



            return cabecera;
        }

        public async Task<bool> DetalleBaja(MEC_MovimientosDetalle nuevoDetalle)
        {
            if (nuevoDetalle.IdMovimientoCabecera <= 0 || string.IsNullOrWhiteSpace(nuevoDetalle.NumDoc))
                return false;

            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.MEC_MovimientosDetalle.Add(nuevoDetalle);
                await _context.SaveChangesAsync();

                var cabecera = await _context.MEC_MovimientosCabecera
                .Include(c => c.Establecimientos)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == nuevoDetalle.IdMovimientoCabecera);

                var bajas = new MEC_MovimientosBajas
                {
                    IdTipoEstablecimiento = cabecera.Establecimientos.IdTipoEstablecimiento,
                    Anio = cabecera.Anio,
                    IdEstablecimiento = cabecera.Establecimientos.IdEstablecimiento,
                    SuplenteDNI = null,
                    SuplenteApellido = null,
                    SuplenteNombre = null,
                    CantHoras = nuevoDetalle.Horas,
                    Estado = "H",
                    Ingreso = null,
                    IngresoDescripcion = null,
                    Observaciones = null,
                    IdPOF = nuevoDetalle.IdPOF,
                    IdMotivoBaja = nuevoDetalle.IdMotivoBaja,
                    FechaInicio = nuevoDetalle.FechaInicioBaja,
                    FechaFin = nuevoDetalle.FechaFinBaja,
                };


                _context.MEC_MovimientosBajas.Add(bajas);
                await _context.SaveChangesAsync();

                await ActualizarApellidosCabeceraAsync(cabecera.IdMovimientoCabecera);

                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<UsuarioInfoDTO> ObtenerEstablecimientosYRolesAsync(int idUsuario)
        {
            var establecimientos = await _context.MEC_UsuariosEstablecimientos
                .Where(uxe => uxe.IdUsuario == idUsuario && uxe.Vigente == "S")
                .Select(uxe => uxe.IdEstablecimiento)
                .Distinct()
                .ToListAsync();

            var roles = await _context.MEC_RolesXUsuarios
                .Where(rxu => rxu.IdUsuario == idUsuario)
                .Select(rxu => rxu.Rol!.NombreRol)    
                .ToListAsync();

            return new UsuarioInfoDTO
            {
                IdsEstablecimientos = establecimientos,
                Roles = roles
            };
        }

        public async Task<List<int>> ObtenerIdsPorUsuarioAsync(int idUsuario)
        {
            return await _context.MEC_UsuariosEstablecimientos
                .Where(uxe => uxe.IdUsuario == idUsuario && uxe.Vigente == "S")
                .Select(uxe => uxe.IdEstablecimiento)
                .Distinct()
                .ToListAsync();
        }

        //borrar detalle

        public async Task<bool> EliminarDetalle(int IdMovimientoDetalle)
        {
            var detalle = await _context.MEC_MovimientosDetalle
                                   .FirstOrDefaultAsync(d => d.IdMovimientoDetalle == IdMovimientoDetalle);

            if (detalle == null)
                return false;

            int idCabecera = detalle.IdMovimientoCabecera;

            _context.MEC_MovimientosDetalle.Remove(detalle);

            await _context.SaveChangesAsync();

            await ActualizarApellidosCabeceraAsync(idCabecera);

            return true;
        }

        //en caso de que siga habiendo un error en el find con IdMOvimientoDetalle, utilizar la version con RAW SQL
        //public async Task<bool> EliminarDetalle(int IdMovimientoDetalle)
        //{
        //    {
        //        var filasAfectadas = await _context.Database.ExecuteSqlRawAsync(
        //           @"DELETE FROM ""MEC_MovimientosDetalle"" 
        //          WHERE ""IdMovimientoDetalle"" = {0}",
        //           IdMovimientoDetalle);

        //        return filasAfectadas > 0;
        //    }

        //}


        //MODIFICACION CON HORAS DECRECECIENTES
        public async Task AgregarDetalle(MEC_MovimientosDetalle detalle)
        {
            _context.MEC_MovimientosDetalle.Add(detalle);
            var cabecera = await _context.MEC_MovimientosCabecera
                    .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == detalle.IdMovimientoCabecera);

            if (cabecera == null)
                throw new Exception("Movimiento cabecera no encontrado.");

            await _context.SaveChangesAsync();
            await ActualizarApellidosCabeceraAsync(cabecera.IdMovimientoCabecera);

        }

        //Datos para el reporte
        public async Task<DetalleReporteDTO> ObtenerDetallesReporteAsycn(int idCabecera)
        {
            // Obtener el usuario logueado
            var usuarioId = GetUserIdFromToken();
            var usuario = await _context.MEC_Usuarios
                .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId);

            if (usuario == null)
                throw new InvalidOperationException("Usuario no encontrado.");

            var cabecera = await _context.MEC_MovimientosCabecera
                .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == idCabecera && c.Estado == "E");

            if (cabecera == null)
                throw new InvalidOperationException("Cabecera no encontrada o no está en estado E.");

            //detalles
            var detalles = await _context.MEC_MovimientosDetalle
                .Where(d => d.IdMovimientoCabecera == idCabecera && d.MovimientoCabecera.Estado == "E" && d.TipoMovimiento== "B" )
                .Select(d => new MovimientosDetalleDTO
                {
                    IdMovimientoCabecera = d.IdMovimientoCabecera,
                    IdMovimientoDetalle = d.IdMovimientoDetalle,
                    IdTipoFuncion = d.IdTipoFuncion,
                    IdPOF = d.IdPOF ?? null,
                    IdTipoCategoria = d.IdTipoCategoria,
                    IdMotivoBaja = d.IdMotivoBaja ?? null,
                    TipoDoc = d.TipoDoc,
                    TipoMovimiento = d.TipoMovimiento,
                    NumDoc = d.NumDoc,
                    Apellido = d.Apellido,
                    Nombre = d.Nombre,
                    SitRevista = d.SitRevista,
                    Turno = d.Turno,
                    Observaciones = d.Observaciones,
                    AntigAnios = d.AntigAnios ?? null,
                    AntigMeses = d.AntigMeses ?? null,
                    Horas = d.Horas,
                    FechaInicioBaja = d.FechaInicioBaja ?? null,
                    FechaFinBaja = d.FechaFinBaja ?? null,
                    Decrece = d.Decrece,
                    HorasDecrece = d.HorasDecrece,
                })
                .ToListAsync();

            //baja
            var bajas = await _context.MEC_MovimientosBajas
              .Where(b => b.IdEstablecimiento == cabecera.IdEstablecimiento
                       && b.Anio == cabecera.Anio && b.Ingreso == null)
              .Select(b => new MovimientosBajasDTO
              {
                  IdMovimientoBaja = b.IdMovimientoBaja,
                  IdEstablecimiento = b.IdEstablecimiento,
                  IdPOF = b.IdPOF,
                  IdMotivoBaja = b.IdMotivoBaja,
                  Anio = b.Anio,
                  SuplenteDNI = b.SuplenteDNI,
                  SuplenteApellido = b.SuplenteApellido,
                  SuplenteNombre = b.SuplenteNombre,
                  FechaInicio = b.FechaInicio,
                  FechaFin = b.FechaFin,
                  CantHoras = b.CantHoras,
                  Estado = b.Estado,
                  Ingreso = b.Ingreso,
                  IngresoDescripcion = b.IngresoDescripcion,
                  Observaciones = b.Observaciones
              })
              .ToListAsync();

            var resultado = new DetalleReporteDTO
            {
                Usuario = usuario.Nombre,
                NombrePersona = usuario.NombrePersona,
                ApellidoPersona = usuario.ApellidoPersona,
                Detalles = detalles,
                Bajas = bajas
            };

            return resultado;
        }

        public async Task<MEC_MovimientosSuperCabecera> CrearSuperCabeceraAsync(MEC_MovimientosSuperCabecera entidad)
        {
            entidad.Fecha = DateTime.Today;

            bool existe = await _context.MEC_MovimientosSuperCabecera.AnyAsync(x =>
                  x.Area.Trim() == entidad.Area.Trim() &&
                  x.Mes == entidad.Mes &&
                  x.Anio == entidad.Anio &&
                  x.IdEstablecimiento == entidad.IdEstablecimiento
              );

            if (existe)
            {
                throw new InvalidOperationException(
                    $"Ya existe un registro para el Área {entidad.Area}, Mes {entidad.Mes}, Año {entidad.Anio}, Establecimiento {entidad.Establecimiento}."
                );
            }

            _context.MEC_MovimientosSuperCabecera.Add(entidad);
            await _context.SaveChangesAsync();

            return entidad;

        }

        //UPDATE SUPERCABECERA
        public async Task<MEC_MovimientosSuperCabecera> ActualizarSuperCabeceraAsync(MEC_MovimientosSuperCabecera entidad)
        {
            bool existe = await _context.MEC_MovimientosSuperCabecera.AnyAsync(x =>
                x.IdSuperCabecera != entidad.IdSuperCabecera &&  
                x.Area.Trim() == entidad.Area.Trim() &&
                x.Mes == entidad.Mes &&
                x.Anio == entidad.Anio &&
                x.IdEstablecimiento == entidad.IdEstablecimiento
            );

            if (existe)
            {
                throw new InvalidOperationException(
                    $"Ya existe un registro para el Área {entidad.Area}, Mes {entidad.Mes}, Año {entidad.Anio}, Establecimiento {entidad.Establecimiento}."
                );
            }

            var existente = await _context.MEC_MovimientosSuperCabecera
                .FirstOrDefaultAsync(x => x.IdSuperCabecera == entidad.IdSuperCabecera);

            if (existente == null)
                throw new KeyNotFoundException("No se encontró la SuperCabecera a actualizar.");

            // Actualizar valores
            existente.Area = entidad.Area.Trim();
            existente.Mes = entidad.Mes;
            existente.Anio = entidad.Anio;
            existente.IdEstablecimiento = entidad.IdEstablecimiento;
            //existente.Fecha = DateTime.Today;
            //existente.Fecha = existente.Fecha;

            _context.MEC_MovimientosSuperCabecera.Update(existente);
            await _context.SaveChangesAsync();

            return existente;
        }


        //Actualizacion de apellidos en MovimientosDetalle
        public async Task ActualizarApellidosCabeceraAsync(int idMovimientoCabecera)
        {
            var detalles = await _context.MEC_MovimientosDetalle
        .Where(d => d.IdMovimientoCabecera == idMovimientoCabecera)
        .ToListAsync();

            var apellidos = new List<string>();

            apellidos.AddRange(
                detalles
                    .Where(d => (d.TipoMovimiento == "A" || d.TipoMovimiento == "M" || d.TipoMovimiento == "D") && !string.IsNullOrWhiteSpace(d.Apellido))
                    .Select(d => d.Apellido.Trim())
            );

            var idsPOF = detalles
                .Where(d => d.TipoMovimiento == "B" && d.IdPOF.HasValue)
                .Select(d => d.IdPOF.Value)
                .Distinct()
                .ToList();

            if (idsPOF.Any())
            {
                var apellidosPOF = await _context.MEC_POF
                    .Where(p => idsPOF.Contains(p.IdPOF))
                    .Select(p => p.Persona.Apellido)
                    .ToListAsync();

                apellidos.AddRange(
                    apellidosPOF.Where(a => !string.IsNullOrWhiteSpace(a))
                                .Select(a => a.Trim())
                );
            }

            var cabecera = await _context.MEC_MovimientosCabecera
                .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == idMovimientoCabecera);

            if (cabecera != null)
            {
                cabecera.Apellidos = apellidos.Any()
                    ? string.Join(", ", apellidos)
                    : null;

                _context.MEC_MovimientosCabecera.Update(cabecera);
                _context.Entry(cabecera).Property(c => c.Estado).IsModified = false;

                await _context.SaveChangesAsync();
            }
        }

        //ESTADO DEVOLVER A EST

        public async Task DevolverCabeceraParaCorreccionAsync(int idCabecera, string observaciones)
        {
            var cabecera = await _context.MEC_MovimientosCabecera
                .FirstOrDefaultAsync(c => c.IdMovimientoCabecera == idCabecera);

            if (cabecera == null)
                throw new KeyNotFoundException("No se encontró la cabecera.");

            cabecera.Estado = "R";
            cabecera.Observaciones = observaciones;
            //cabecera.Fecha = DateTime.Now;

            _context.MEC_MovimientosCabecera.Update(cabecera);
            await _context.SaveChangesAsync();
        }
    }
}
