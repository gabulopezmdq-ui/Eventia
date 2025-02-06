using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace API.Services
{
    public class ProcesarMecanizadaService<T> : IProcesarMecanizadaService<T> where T : class
    {
        private readonly DataContext _context;

        public ProcesarMecanizadaService(DataContext context)
        {
            _context = context;
        }

        public async Task<string> HandlePreprocesarArchivoAsync(int idCabecera)
        {
            try
            {
                await PreprocesarAsync(idCabecera);
                return $"ID recibido: {idCabecera} y preprocesado exitosamente.";
            }
            catch (Exception ex)
            {
                return $"Error al procesar la cabecera con ID {idCabecera}: {ex.Message}";
            }
        }

        public async Task PreprocesarAsync(int idCabecera)
        {
            // 1. Usar AsNoTracking para la cabecera (operación de solo lectura)
            var cabecera = await _context.MEC_CabeceraLiquidacion
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera)
                                        .ConfigureAwait(false);

            if (cabecera == null || cabecera.Estado != "I")
            {
                throw new Exception("La cabecera no existe o no está en estado 'I'.");
            }

            // 2. Ejecutar validaciones secuencialmente con ConfigureAwait(false)
            await ValidarNroEstabAsync(idCabecera).ConfigureAwait(false);
            await ValidarCodFuncionAsync(idCabecera).ConfigureAwait(false);
            await ValidarCodLiquidacionAsync(idCabecera).ConfigureAwait(false);
            await ValidarCarRevistaAsync(idCabecera).ConfigureAwait(false);
            await ValidarTipoOrgAsync(idCabecera).ConfigureAwait(false);

            // 3. Guardar cambios acumulados
            await _context.SaveChangesAsync().ConfigureAwait(false);

            // 4. Verificar errores de manera atómica
            bool tieneErrores = await VerificarErroresAsync(idCabecera).ConfigureAwait(false);

            if (tieneErrores)
            {
                await EliminarRegistrosAsync(idCabecera).ConfigureAwait(false);
                await CambiarEstadoCabeceraAsync(idCabecera, "P").ConfigureAwait(false);
                await _context.SaveChangesAsync().ConfigureAwait(false);
                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            // 5. Validación MEC con operaciones secuenciales
            await ValidarMecAsync(idCabecera).ConfigureAwait(false);

            // 6. Verificar registros inválidos
            var registrosInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera && m.RegistroValido == "N")
                .ToListAsync()
                .ConfigureAwait(false);

            if (registrosInvalidos.Any())
            {
                string leyenda = "Existen Personas que no están registradas en el sistema...";
                throw new Exception(leyenda); // Eliminado el DisposeAsync
            }
        }

        

        private async Task<bool> VerificarErroresAsync(int idCabecera)
        {
            bool tieneErrores = false;

            // Ejecutar cada validación secuencialmente
            tieneErrores |= await _context.MEC_TMPErroresEstablecimientos
                .AnyAsync(e => e.IdCabecera == idCabecera);

            tieneErrores |= await _context.MEC_TMPErroresFuncion
                .AnyAsync(e => e.IdCabecera == idCabecera);

            tieneErrores |= await _context.MEC_TMPErroresConceptos
                .AnyAsync(e => e.IdCabecera == idCabecera);

            tieneErrores |= await _context.MEC_TMPErroresCarRevista
                .AnyAsync(e => e.IdCabecera == idCabecera);

            tieneErrores |= await _context.MEC_TMPErroresTiposEstablecimientos
                .AnyAsync(e => e.IdCabecera == idCabecera);

            return tieneErrores;
        }

        private async Task EliminarRegistrosAsync(int idCabecera)
        {
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(m => m.idCabecera == idCabecera)
                                          .ToListAsync();

            if (!registros.Any())
                throw new InvalidOperationException($"No se encontraron registros con idCabecera = {idCabecera}.");

            await _context.Database.ExecuteSqlRawAsync(
                @"DELETE FROM ""MEC_TMPMecanizadas"" WHERE ""idCabecera"" = {0};", idCabecera);

            await _context.Database.ExecuteSqlRawAsync(
                @"ALTER SEQUENCE ""MEC_TMPMecanizadas_idTMPMecanizada_seq"" RESTART WITH 1;");
        }

        private async Task CambiarEstadoCabeceraAsync(int idCabecera, string estado)
        {
            var estadoCabecera = await _context.MEC_CabeceraLiquidacion
                                               .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (estadoCabecera != null)
            {
                estadoCabecera.Estado = estado;
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarNroEstabAsync(int idCabecera)
        {
            var nroEstabInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.NroEstab)
                .Distinct()
                .Where(nro => !_context.MEC_Establecimientos.Any(e => e.NroDiegep == nro))
                .ToListAsync();

            if (nroEstabInvalidos.Any())
            {
                var erroresEstablecimientos = nroEstabInvalidos
                    .Select(nro => new MEC_TMPErroresEstablecimientos
                    {
                        IdCabecera = idCabecera,
                        NroEstab = nro
                    });

                _context.MEC_TMPErroresEstablecimientos.AddRange(erroresEstablecimientos);
         
            }
        }

        private async Task ValidarCodFuncionAsync(int idCabecera)
        {
            var codFuncionInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.Funcion)
                .Distinct()
                .Where(cod => !_context.MEC_TiposFunciones.Any(f => f.CodFuncion == cod))
                .ToListAsync();

            if (codFuncionInvalidos.Any())
            {
                var erroresFuncion = codFuncionInvalidos
                    .Select(cod => new MEC_TMPErroresFuncion
                    {
                        IdCabecera = idCabecera,
                        CodFuncion = cod
                    });

                _context.MEC_TMPErroresFuncion.AddRange(erroresFuncion);
            }
        }

        private async Task ValidarCodLiquidacionAsync(int idCabecera)
        {
            var codLiquidacionInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.CodigoLiquidacion)
                .Distinct()
                .Where(cod => !_context.MEC_Conceptos.Any(f => f.CodConcepto == cod))
                .ToListAsync();

            if (codLiquidacionInvalidos.Any())
            {
                var erroresConceptos = codLiquidacionInvalidos
                    .Select(cod => new MEC_TMPErroresConceptos
                    {
                        IdCabecera = idCabecera,
                        CodigoLiquidacion = cod
                    });

                _context.MEC_TMPErroresConceptos.AddRange(erroresConceptos);
                
            }
        }

        private async Task ValidarCarRevistaAsync(int idCabecera)
        {
            var carRevistaInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.CaracterRevista)
                .Distinct()
                .Where(cod => !_context.MEC_CarRevista.Any(f => f.CodPcia == cod))
                .ToListAsync();

            if (carRevistaInvalidos.Any())
            {
                var erroresCarRevista = carRevistaInvalidos
                    .Select(cod => new MEC_TMPErroresCarRevista
                    {
                        IdCabecera = idCabecera,
                        CaracterRevista = cod
                    });

                _context.MEC_TMPErroresCarRevista.AddRange(erroresCarRevista);
            }
        }

        private async Task ValidarTipoOrgAsync(int idCabecera)
        {
            var tipoOrgInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.TipoOrganizacion)
                .Distinct()
                .Where(cod => !_context.MEC_TiposEstablecimientos.Any(f => f.CodTipoEstablecimiento == cod))
                .ToListAsync();

            if (tipoOrgInvalidos.Any())
            {
                var erroresTiposEstablecimientos = tipoOrgInvalidos
                    .Select(cod => new MEC_TMPErroresTiposEstablecimientos
                    {
                        IdCabecera = idCabecera,
                        TipoOrganizacion = cod
                    });

                await _context.MEC_TMPErroresTiposEstablecimientos.AddRangeAsync(erroresTiposEstablecimientos);
            }
        }

        private async Task ValidarMecAsync(int idCabecera)
        {
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(e => e.idCabecera == idCabecera)
                                          .ToListAsync();

            var detallesPOF = new List<MEC_POFDetalle>();
            var erroresMec = new List<MEC_TMPErroresMecanizadas>();

            foreach (var registro in registros)
            {
                var persona = await _context.MEC_Personas.AsNoTracking()
                                            .FirstOrDefaultAsync(x => x.DNI == registro.Documento);

                if (persona == null)
                {
                    RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                var establecimiento = await _context.MEC_Establecimientos
                    .Where(e => e.NroDiegep == registro.NroEstab).Select(e => e.IdEstablecimiento).FirstOrDefaultAsync();

                var POF = await _context.MEC_POF
                                         .FirstOrDefaultAsync(p => p.IdEstablecimiento == establecimiento &&
                                                                   p.IdPersona == persona.IdPersona &&
                                                                   p.Secuencia == registro.Secuencia);

                if (POF == null)
                {
                    RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }


                var detalle = await ProcesarDetallePOFAsync(idCabecera, POF, registro);
                detallesPOF.Add(detalle);
                registro.RegistroValido = "S";
            } 
            // Agregar todos los detalles y errores de una sola vez
            _context.MEC_POFDetalle.AddRange(detallesPOF);
            _context.MEC_TMPErroresMecanizadas.AddRange(erroresMec);

            // Guardar cambios una sola vez
            await _context.SaveChangesAsync();
        }

        private async Task<MEC_POFDetalle> ProcesarDetallePOFAsync(int idCabecera, MEC_POF POF, MEC_TMPMecanizadas registro)
        {
            var nuevoDetallePOF = new MEC_POFDetalle
            {
                IdCabecera = idCabecera,
                IdPOF = POF.IdPOF,
                CantHorasCS = Convert.ToInt32(registro.HorasDesignadas ?? 0)
            };

            var antiguedad = await _context.MEC_POF_Antiguedades
                                           .FirstOrDefaultAsync(a => a.IdPersona == POF.IdPersona);

            if (antiguedad != null)
            {
                var cabecera = await _context.MEC_CabeceraLiquidacion
                                             .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

                var antiguedadResult = CalcularAntiguedad(
                    ConvertirStringAIntNullable(cabecera?.MesLiquidacion),
                    ConvertirStringAIntNullable(cabecera?.AnioLiquidacion),
                    antiguedad.MesReferencia,
                    antiguedad.AnioReferencia,
                    antiguedad.AnioAntiguedad,
                    antiguedad.MesAntiguedad
                );

                nuevoDetallePOF.AntiguedadAnios = antiguedadResult.antiguedadAnios.GetValueOrDefault();
                nuevoDetallePOF.AntiguedadMeses = antiguedadResult.antiguedadMeses.GetValueOrDefault();
            }

            return nuevoDetallePOF; // <-- Asegúrate de retornar el objeto
        }
        //private async Task ProcesarDetallePOFAsync(int idCabecera, MEC_POF POF, MEC_TMPMecanizadas registro)
        //{
        //    var nuevoDetallePOF = new MEC_POFDetalle
        //    {
        //        IdCabecera = idCabecera,
        //        IdPOF = POF.IdPOF,
        //        CantHorasCS = Convert.ToInt32(registro.HorasDesignadas ?? 0)
        //    };

        //    _context.MEC_POFDetalle.Add(nuevoDetallePOF);

        //    var antiguedad = await _context.MEC_POF_Antiguedades
        //                                   .FirstOrDefaultAsync(a => a.IdPOF == POF.IdPOF);

        //    if (antiguedad != null)
        //    {
        //        var cabecera = await _context.MEC_CabeceraLiquidacion
        //                                     .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

        //        var antiguedadResult = CalcularAntiguedad(
        //            ConvertirStringAIntNullable(cabecera?.MesLiquidacion),
        //            ConvertirStringAIntNullable(cabecera?.AnioLiquidacion),
        //            antiguedad.MesReferencia,
        //            antiguedad.AnioReferencia,
        //            antiguedad.AnioAntiguedad,
        //            antiguedad.MesAntiguedad
        //        );

        //        nuevoDetallePOF.AntiguedadAnios = antiguedadResult.antiguedadAnios.GetValueOrDefault();
        //        nuevoDetallePOF.AntiguedadMeses = antiguedadResult.antiguedadMeses.GetValueOrDefault();

        //        registro.RegistroValido = "S";
        //    }
        //    else
        //    {
        //        var POFMec = _context.MEC_POF.FirstOrDefault(p => p.Persona.DNI == registro.Documento);
        //        var error = new MEC_TMPErroresMecanizadas
        //        {
        //            IdCabecera = idCabecera,
        //            IdTMPMecanizada = registro.idTMPMecanizada,
        //            Antiguedad = "NE",
        //            Documento = registro.Documento,
        //            POF = POFMec.ToString()

        //        };

        //        registro.RegistroValido = "N";
        //    }

        //    await _context.SaveChangesAsync();
        //}

        private void RegistroErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
        {
            // Reattach solo si es necesario
            if (_context.Entry(registro).State == EntityState.Detached)
            {
                _context.Attach(registro);
            }

            registro.RegistroValido = registroValido;
            _context.Entry(registro).Property(x => x.RegistroValido).IsModified = true;

            _context.MEC_TMPErroresMecanizadas.Add(new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = documentoError,
                POF = pofError
            });

            // Eliminar await _context.SaveChangesAsync();
        }

        public (int? antiguedadAnios, int? antiguedadMeses) CalcularAntiguedad(int? mesLiquidacion, int? anioLiquidacion,
                                                                        int? mesReferencia, int? anioReferencia,
                                                                        int? antiguedadAnios, int? antiguedadMeses)
        {
            mesLiquidacion ??= 1;
            anioLiquidacion ??= 1;
            mesReferencia ??= 1;
            anioReferencia ??= 1;
            antiguedadAnios ??= 0;
            antiguedadMeses ??= 0;

            if (anioLiquidacion == anioReferencia)
            {
                int antigMeses = mesLiquidacion.GetValueOrDefault() - mesReferencia.GetValueOrDefault();
                if (antigMeses >= 0)
                {
                    antiguedadAnios = 0;
                    antiguedadMeses = antigMeses;
                }
                else
                {
                    antiguedadAnios = -1;
                    antiguedadMeses = 12 + antigMeses;
                }
            }
            else
            {
                antiguedadAnios = anioLiquidacion - anioReferencia;
                if (mesLiquidacion.GetValueOrDefault() >= mesReferencia.GetValueOrDefault())
                {
                    antiguedadMeses = mesLiquidacion.GetValueOrDefault() - mesReferencia.GetValueOrDefault();
                }
                else
                {
                    antiguedadAnios -= 1;
                    antiguedadMeses = 12 + mesLiquidacion.GetValueOrDefault() - mesReferencia.GetValueOrDefault();
                }
            }
            return (antiguedadAnios, antiguedadMeses);
        }

        private int? ConvertirStringAIntNullable(string valor)
        {
            return int.TryParse(valor, out var result) ? result : (int?)null;
        }

        public async Task<bool> VerificarTodosRegistrosValidosAsync(int idCabecera)
        {
            return await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .AllAsync(m => m.RegistroValido == "S");
        }

        public async Task<string> ProcesarSiEsValidoAsync(int idCabecera, int usuario)
        {
            // Verificar si todos los registros son válidos
            bool todosValidos = await VerificarTodosRegistrosValidosAsync(idCabecera)
                .ConfigureAwait(false);

            if (!todosValidos) return "No todos los registros tienen RegistroValido = 'S'.";

            // Obtener registros de MEC_TMPMecanizadas (solo lectura)
            var registros = await _context.MEC_TMPMecanizadas
                .AsNoTracking()
                .Where(m => m.idCabecera == idCabecera)
                .ToListAsync()
                .ConfigureAwait(false);

            var mecanizadas = new List<MEC_Mecanizadas>();

            // Procesar registros de forma secuencial
            foreach (var registro in registros)
            {
                var persona = await _context.MEC_Personas
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.DNI == registro.Documento)
                    .ConfigureAwait(false);

                if (persona == null) continue;

                var idEstablecimiento = await _context.MEC_Establecimientos
                    .AsNoTracking()
                    .Where(e => e.NroDiegep == registro.NroEstab)
                    .Select(e => e.IdEstablecimiento)
                    .FirstOrDefaultAsync()
                    .ConfigureAwait(false);

                if (idEstablecimiento == 0) continue;

                var POF = await _context.MEC_POF
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.IdEstablecimiento == idEstablecimiento
                                           && p.IdPersona == persona.IdPersona
                                           && p.Secuencia == registro.Secuencia)
                    .ConfigureAwait(false);

                if (POF != null)
                {
                    mecanizadas.Add(new MEC_Mecanizadas
                    {
                        FechaConsolidacion = DateTime.Now,
                        IdUsuario = usuario,
                        IdCabecera = idCabecera,
                        IdPOF = POF.IdPOF,
                        IdEstablecimiento = POF.IdEstablecimiento,
                        MesLiquidacion = registro.MesLiquidacion,
                        OrdenPago = registro.OrdenPago,
                        AnioMesAfectacion = registro.AnioMesAfectacion,
                        Importe = registro.Importe,
                        Signo = registro.Signo,
                        MarcaTransferido = registro.MarcaTransferido,
                        Moneda = registro.Moneda,
                        RegimenEstatutario = registro.RegimenEstatutario,
                        Dependencia = registro.Dependencia,
                        Distrito = registro.Distrito,
                        Subvencion = registro.Subvencion,
                        Origen = "MEC",
                        Consolidado = "N",
                    });
                }
            }

            // Ejecutar todas las operaciones de escritura de forma atómica
            await using var transaction = await _context.Database.BeginTransactionAsync().ConfigureAwait(false);

            try
            {
                // 1. Insertar mecanizadas
                await _context.MEC_Mecanizadas.AddRangeAsync(mecanizadas).ConfigureAwait(false);

                // 2. Actualizar cabecera
                var cabecera = await _context.MEC_CabeceraLiquidacion
                    .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera)
                    .ConfigureAwait(false);

                if (cabecera != null)
                {
                    cabecera.Estado = "R";
                }


                // 3. Eliminar errores 
                await _context.Database.ExecuteSqlRawAsync(
                     @"DELETE FROM ""MEC_TMPErroresMecanizadas"" WHERE ""IdCabecera"" = {0}",
                        idCabecera
                ).ConfigureAwait(false);

                // 4. Insertar estado
                await _context.MEC_CabeceraLiquidacionEstados.AddAsync(new MEC_CabeceraLiquidacionEstados
                {
                    IdCabecera = idCabecera,
                    FechaCambioEstado = DateTime.Now,
                    IdUsuario = usuario,
                    Estado = "R"
                }).ConfigureAwait(false);

                // 5. Actualizaciones masivas
                await _context.MEC_InasistenciasCabecera
                    .Where(i => i.IdCabecera == idCabecera)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Estado, "H"))
                    .ConfigureAwait(false);

                await _context.MEC_BajasCabecera
                    .Where(b => b.IdCabecera == idCabecera)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Estado, "H"))
                    .ConfigureAwait(false);

                // Confirmar transacción
                await _context.SaveChangesAsync().ConfigureAwait(false);
                await transaction.CommitAsync().ConfigureAwait(false);
            }
            catch
            {
                await transaction.RollbackAsync().ConfigureAwait(false);
                throw;
            }

            return "Registros procesados correctamente.";
        }
    }
}
