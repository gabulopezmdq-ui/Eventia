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
            var cabecera = await _context.MEC_CabeceraLiquidacion
<<<<<<< HEAD
                                         .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera == null || cabecera.Estado != "I")
            {
                throw new Exception("No se encontró la cabecera o no está en estado 'I'.");
            }

            await ValidarNroEstabAsync(idCabecera);
            await ValidarCodFuncionAsync(idCabecera);
            await ValidarCodLiquidacionAsync(idCabecera);
            await ValidarCarRevistaAsync(idCabecera);
            await ValidarTipoOrgAsync(idCabecera);

            if (await VerificarErroresAsync(idCabecera))
=======
                                          .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera == null || cabecera.Estado != "I")
            {
                throw new Exception("La cabecera no existe o no está en estado 'I'.");
            }

            await ValidarDatosCabeceraAsync(idCabecera);
            bool tieneErrores = await VerificarErroresAsync(idCabecera);

            if (tieneErrores)
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546
            {
                await EliminarRegistrosAsync(idCabecera);
                await CambiarEstadoCabeceraAsync(idCabecera, "P");
                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            await ValidarMecAsync(idCabecera);

            // Verificar si hay registros con RegistroValido = "N"
            var registrosInvalidos = await _context.MEC_TMPMecanizadas
                                                    .Where(m => m.idCabecera == idCabecera && m.RegistroValido == "N")
                                                    .ToListAsync();

            if (registrosInvalidos.Any())
            {
                // Crear la leyenda
                string leyenda = "Existen Personas que no están registradas en el sistema, no están dadas de alta en la POF del Establecimiento, o no tienen cargada la Antigüedad base.\n" +
                                 "Por favor para cada uno de los registros que se muestran a continuación, genere el alta en el sistema\n" +
                                 "Una vez realizada las correcciones, vuelva a ejecutar el proceso Pre-Procesar Mecanizada.\n" +
                                 "Realice este proceso las veces necesarias hasta que todos los registros del archivo estén correctos.";

                // Puedes agregar la leyenda como un detalle adicional o mostrarla según el contexto
                throw new Exception(leyenda);
            } 
        }

        private async Task ValidarDatosCabeceraAsync(int idCabecera)
        {
                    var tareas = new List<Task>
            {
                ValidarNroEstabAsync(idCabecera),
                ValidarCodFuncionAsync(idCabecera),
                ValidarCodLiquidacionAsync(idCabecera),
                ValidarCarRevistaAsync(idCabecera),
                ValidarTipoOrgAsync(idCabecera)
            };

                    var resultados = await Task.WhenAll(tareas.Select(task =>
                        task.ContinueWith(t => t, TaskContinuationOptions.ExecuteSynchronously)));

                    foreach (var resultado in resultados)
                    {
                        if (resultado.IsFaulted)
                        {
                            // Manejo de errores para tareas fallidas.
                            Console.WriteLine($"Error: {resultado.Exception}");
                        }
                    }
        }

        private async Task<bool> VerificarErroresAsync(int idCabecera)
        {
            var erroresExistentes = new List<Task<bool>>
            {
                _context.MEC_TMPErroresEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera),
                _context.MEC_TMPErroresFuncion.AnyAsync(e => e.IdCabecera == idCabecera),
                _context.MEC_TMPErroresConceptos.AnyAsync(e => e.IdCabecera == idCabecera),
                _context.MEC_TMPErroresCarRevista.AnyAsync(e => e.IdCabecera == idCabecera),
                _context.MEC_TMPErroresTiposEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera)
            };

            return (await Task.WhenAll(erroresExistentes)).Any(e => e);
        }

        private async Task EliminarRegistrosAsync(int idCabecera)
        {
<<<<<<< HEAD
=======
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(m => m.idCabecera == idCabecera)
                                          .ToListAsync();

            if (!registros.Any())
                throw new InvalidOperationException($"No se encontraron registros con idCabecera = {idCabecera}.");

>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546
            await _context.Database.ExecuteSqlRawAsync(
                @"DELETE FROM ""MEC_TMPMecanizadas"" WHERE ""idCabecera"" = {0};", idCabecera);

            await _context.Database.ExecuteSqlRawAsync(
                @"ALTER SEQUENCE ""MEC_TMPMecanizadas_idTMPMecanizada_seq"" RESTART WITH 1;");
        }

        private async Task CambiarEstadoCabeceraAsync(int idCabecera, string estado)
        {
            var cabecera = await _context.MEC_CabeceraLiquidacion
                                         .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera != null)
            {
                cabecera.Estado = estado;
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarNroEstabAsync(int idCabecera)
        {
<<<<<<< HEAD
            var nroEstabTMP = await _context.MEC_TMPMecanizadas
                                            .Where(m => m.idCabecera == idCabecera)
                                            .Select(m => m.NroEstab)
                                            .Distinct()
                                            .ToListAsync();
=======
            var nroEstabInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.NroEstab)
                .Distinct()
                .Where(nro => !_context.MEC_Establecimientos.Any(e => e.NroDiegep == nro))
                .ToListAsync();
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

            if (nroEstabInvalidos.Any())
            {
<<<<<<< HEAD
                var errores = nroEstabInvalidos.Select(nro => new MEC_TMPErroresEstablecimientos
                {
                    IdCabecera = idCabecera,
                    NroEstab = nro
                });
=======
                var erroresEstablecimientos = nroEstabInvalidos
                    .Select(nro => new MEC_TMPErroresEstablecimientos
                    {
                        IdCabecera = idCabecera,
                        NroEstab = nro
                    });
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                await _context.MEC_TMPErroresEstablecimientos.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
            await _context.SaveChangesAsync();
        }

        private async Task ValidarCodFuncionAsync(int idCabecera)
        {
<<<<<<< HEAD
            var codFuncionTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.Funcion)
                                              .Distinct()
                                              .ToListAsync();
=======
            var codFuncionInvalidos = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .Select(m => m.Funcion)
                .Distinct()
                .Where(cod => !_context.MEC_TiposFunciones.Any(f => f.CodFuncion == cod))
                .ToListAsync();
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

            if (codFuncionInvalidos.Any())
            {
<<<<<<< HEAD
                var errores = codFuncionInvalidos.Select(cod => new MEC_TMPErroresFuncion
                {
                    IdCabecera = idCabecera,
                    CodFuncion = cod
                });
=======
                var erroresFuncion = codFuncionInvalidos
                    .Select(cod => new MEC_TMPErroresFuncion
                    {
                        IdCabecera = idCabecera,
                        CodFuncion = cod
                    });
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                await _context.MEC_TMPErroresFuncion.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarCodLiquidacionAsync(int idCabecera)
        {
<<<<<<< HEAD
            var codLiquidacionTMP = await _context.MEC_TMPMecanizadas
                                                  .Where(m => m.idCabecera == idCabecera)
                                                  .Select(m => m.CodigoLiquidacion)
                                                  .Distinct()
                                                  .ToListAsync();

            var codLiquidacionInvalidos = codLiquidacionTMP.Where(cod =>
                !_context.MEC_Conceptos.Any(c => c.CodConcepto == cod)).ToList();

            if (codLiquidacionInvalidos.Any())
            {
                var errores = codLiquidacionInvalidos.Select(cod => new MEC_TMPErroresConceptos
                {
                    IdCabecera = idCabecera,
                    CodigoLiquidacion = cod
                });
=======
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
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                await _context.MEC_TMPErroresConceptos.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarCarRevistaAsync(int idCabecera)
        {
<<<<<<< HEAD
            var carRevistaTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.CaracterRevista)
                                              .Distinct()
                                              .ToListAsync();

            var carRevistaInvalidos = carRevistaTMP.Where(cod =>
                !_context.MEC_CarRevista.Any(c => c.CodPcia == cod)).ToList();

            if (carRevistaInvalidos.Any())
            {
                var errores = carRevistaInvalidos.Select(cod => new MEC_TMPErroresCarRevista
                {
                    IdCabecera = idCabecera,
                    CaracterRevista = cod
                });
=======
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
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                await _context.MEC_TMPErroresCarRevista.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarTipoOrgAsync(int idCabecera)
        {
<<<<<<< HEAD
            var tipoOrgTMP = await _context.MEC_TMPMecanizadas
                                           .Where(m => m.idCabecera == idCabecera)
                                           .Select(m => m.TipoOrganizacion)
                                           .Distinct()
                                           .ToListAsync();

            var tipoOrgInvalidos = tipoOrgTMP.Where(cod =>
                !_context.MEC_TiposEstablecimientos.Any(c => c.CodTipoEstablecimiento == cod)).ToList();

            if (tipoOrgInvalidos.Any())
            {
                var errores = tipoOrgInvalidos.Select(cod => new MEC_TMPErroresTiposEstablecimientos
                {
                    IdCabecera = idCabecera,
                    TipoOrganizacion = cod
                });
=======
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
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                await _context.MEC_TMPErroresTiposEstablecimientos.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarMecAsync(int idCabecera)
        {
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(e => e.idCabecera == idCabecera)
                                          .ToListAsync();

            foreach (var registro in registros)
            {
                var persona = await _context.MEC_Personas
<<<<<<< HEAD
                                            .FirstOrDefaultAsync(p => p.DNI == registro.Documento);
=======
                                            .FirstOrDefaultAsync(x => x.DNI == registro.Documento);
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546

                if (persona == null)
                {
                    await RegistrarErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

<<<<<<< HEAD
                var pof = await _context.MEC_POF
                                        .FirstOrDefaultAsync(p =>
                                            p.IdEstablecimiento == int.Parse(registro.NroEstab) &&
                                            p.IdPersona == persona.IdPersona &&
                                            p.Secuencia == registro.Secuencia);

                if (pof == null)
=======
                var POF = await _context.MEC_POF
                                         .FirstOrDefaultAsync(p => p.IdEstablecimiento == int.Parse(registro.NroEstab) &&
                                                                   p.IdPersona == persona.IdPersona &&
                                                                   p.Secuencia == registro.Secuencia);

                if (POF == null)
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546
                {
                    await RegistrarErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

<<<<<<< HEAD
=======
                await ProcesarDetallePOFAsync(idCabecera, POF, registro);
<<<<<<< HEAD
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546
                registro.RegistroValido = "S";
                await _context.SaveChangesAsync();
=======
>>>>>>> 324707cb95d0a31700a69f955931ad690e95b91e
            }
        }

<<<<<<< HEAD
        private async Task RegistrarErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
=======
        private async Task ProcesarDetallePOFAsync(int idCabecera, MEC_POF POF, MEC_TMPMecanizadas registro)
        {
            var nuevoDetallePOF = new MEC_POFDetalle
            {
                IdCabecera = idCabecera,
                IdPOF = POF.IdPOF,
                CantHorasCS = Convert.ToInt32(registro.HorasDesignadas ?? 0)
            };

            _context.MEC_POFDetalle.Add(nuevoDetallePOF);

            var antiguedad = await _context.MEC_POF_Antiguedades
                                           .FirstOrDefaultAsync(a => a.IdPOF == POF.IdPOF);

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

                registro.RegistroValido = "S";
            } 
            else
            {
                var POFMec = _context.MEC_POF.FirstOrDefault(p => p.Persona.DNI == registro.Documento);
                var error = new MEC_TMPErroresMecanizadas
                {
                    IdCabecera = idCabecera,
                    IdTMPMecanizada = registro.idTMPMecanizada,
                    Antiguedad = "NE",
                    Documento = registro.Documento,
                    POF = POFMec.ToString()

                };

                registro.RegistroValido = "N";
            }

            await _context.SaveChangesAsync();
        }

        private async Task RegistroErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
>>>>>>> e0525dc4cf7ad76de0358f17396b9982e609a546
        {
            var error = new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = documentoError,
                POF = pofError
            };

            _context.MEC_TMPErroresMecanizadas.Add(error);
            registro.RegistroValido = registroValido;
            await _context.SaveChangesAsync();
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
            bool todosValidos = await VerificarTodosRegistrosValidosAsync(idCabecera);
            if (!todosValidos)
            {
                return "No todos los registros tienen RegistroValido = 'S'.";
            }

            // Obtener registros de MEC_TMPMecanizadas
            var registros = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera)
                .ToListAsync();

            // Insertar registros en MEC_Mecanizadas
            foreach (var registro in registros)
            {
                var persona = await _context.MEC_Personas
                                            .FirstOrDefaultAsync(x => x.DNI == registro.Documento);

                if (persona != null)
                {
                    // Obtener el IdEstablecimiento a partir de NroEstab
                    var idEstablecimiento = await _context.MEC_Establecimientos
                                                           .Where(e => e.NroDiegep == registro.NroEstab)
                                                           .Select(e => e.IdEstablecimiento)
                                                           .FirstOrDefaultAsync();

                    if (idEstablecimiento == 0)
                    {
                        // Si no se encuentra el establecimiento, manejar el error
                        await RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                        continue;
                    }

                    // Buscar POF utilizando el IdEstablecimiento obtenido
                    var POF = await _context.MEC_POF
                                            .FirstOrDefaultAsync(p => p.IdEstablecimiento == idEstablecimiento &&
                                                                      p.IdPersona == persona.IdPersona &&
                                                                      p.Secuencia == registro.Secuencia);


                    if (POF != null)
                    {
                        var mecanizada = new MEC_Mecanizadas
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
                        };

                        _context.MEC_Mecanizadas.Add(mecanizada);
                    }
                }
            }


            // Cambiar el estado de la cabecera
            var cabecera = await _context.MEC_CabeceraLiquidacion
                .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera != null)
            {
                cabecera.Estado = "R";
                _context.MEC_CabeceraLiquidacion.Update(cabecera);
            }

            // Eliminar registros de MEC_TMPErroresMecanizadas
            var errores = _context.MEC_TMPErroresMecanizadas
                .Where(e => e.IdCabecera == idCabecera);

            _context.MEC_TMPErroresMecanizadas.RemoveRange(errores);

            // Insertar registro en MEC_CabeceraLiquidacionEstados
            var estado = new MEC_CabeceraLiquidacionEstados
            {
                IdCabecera = idCabecera,
                FechaCambioEstado = DateTime.Now,
                IdUsuario = usuario,
                Estado = "R"
            };

            _context.MEC_CabeceraLiquidacionEstados.Add(estado);

            // Actualizar registros en MEC_InasistenciasCabecera
            var inasistencias = await _context.MEC_InasistenciasCabecera
                .Where(i => i.IdCabecera == idCabecera)
                .ToListAsync();

            foreach (var inasistencia in inasistencias)
            {
                inasistencia.Estado = "H";
            }
            _context.MEC_InasistenciasCabecera.UpdateRange(inasistencias);

            // Actualizar registros en MEC_BajasCabecera
            var bajas = await _context.MEC_BajasCabecera
                .Where(b => b.IdCabecera == idCabecera)
                .ToListAsync();

            foreach (var baja in bajas)
            {
                baja.Estado = "H";
            }
            _context.MEC_BajasCabecera.UpdateRange(bajas);

            // Guardar todos los cambios
            await _context.SaveChangesAsync();

            return "Registros procesados correctamente.";
        }


    }
}
