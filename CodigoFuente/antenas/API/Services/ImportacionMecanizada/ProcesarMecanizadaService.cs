using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using API.DataSchema.DTO;
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
            // 1. Cabecera (solo lectura)
            var cabecera = await _context.MEC_CabeceraLiquidacion
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera)
                                        .ConfigureAwait(false);

            if (cabecera == null || cabecera.Estado != "I")
                throw new Exception("La cabecera no existe o no está en estado 'I'.");

            // 2. Cargar registros temporales
            var mecanizadasFiltradas = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera && m.OrdenPago == cabecera.OrdenPago)
                .ToListAsync()
                .ConfigureAwait(false);

            if (!mecanizadasFiltradas.Any())
                throw new Exception("No se encontraron registros en MEC_TMPMecanizadas que coincidan con la Orden de Pago de la cabecera.");

            // 3. Cargar catálogos a memoria
            var hsEstablecimientos = new HashSet<string>(await _context.MEC_Establecimientos.Select(e => e.NroDiegep).ToListAsync());
            var hsFunciones = new HashSet<string>(await _context.MEC_TiposFunciones.Select(f => f.CodFuncion).ToListAsync());
            var hsConceptos = new HashSet<string>(await _context.MEC_Conceptos.Select(c => c.CodConcepto).ToListAsync());
            var hsCarRevista = new HashSet<string>(await _context.MEC_CarRevista.Select(c => c.CodPcia).ToListAsync());
            var hsTiposEstablecimientos = new HashSet<string>(await _context.MEC_TiposEstablecimientos.Select(t => t.CodTipoEstablecimiento).ToListAsync());

            // 4. Validaciones en memoria
            await ValidarNroEstabOptimizadoAsync(idCabecera, mecanizadasFiltradas, hsEstablecimientos);
            await ValidarCodFuncionOptimizadoAsync(idCabecera, mecanizadasFiltradas, hsFunciones);
            await ValidarCodLiquidacionOptimizadoAsync(idCabecera, mecanizadasFiltradas, hsConceptos);
            await ValidarCarRevistaOptimizadoAsync(idCabecera, mecanizadasFiltradas, hsCarRevista);
            await ValidarTipoOrgOptimizadoAsync(idCabecera, mecanizadasFiltradas, hsTiposEstablecimientos);

            // 5. Guardar cambios acumulados
            await _context.SaveChangesAsync().ConfigureAwait(false);

            // 6. Verificar errores de manera atómica
            bool tieneErrores = await VerificarErroresAsync(idCabecera).ConfigureAwait(false);

            if (tieneErrores)
            {
                await EliminarRegistrosAsync(idCabecera).ConfigureAwait(false);
                await CambiarEstadoCabeceraAsync(idCabecera, "P").ConfigureAwait(false);
                await _context.SaveChangesAsync().ConfigureAwait(false);
                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            // 7. Validación MEC
            await ValidarMecAsync(idCabecera, mecanizadasFiltradas).ConfigureAwait(false);

            // 8. Verificar registros inválidos
            var registrosInvalidos = mecanizadasFiltradas.Where(m => m.RegistroValido == "N").ToList();

            if (registrosInvalidos.Any())
                throw new Exception("Existen Personas que no están registradas en el sistema...");
        }

        private Task ValidarNroEstabOptimizadoAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadas, HashSet<string> hsEstablecimientos)
        {
            var invalidos = mecanizadas
                .Select(m => m.NroEstab)
                .Distinct()
                .Where(n => !hsEstablecimientos.Contains(n));

            if (invalidos.Any())
            {
                var errores = invalidos.Select(n => new MEC_TMPErroresEstablecimientos
                {
                    IdCabecera = idCabecera,
                    NroEstab = n
                });
                _context.MEC_TMPErroresEstablecimientos.AddRange(errores);
            }

            return Task.CompletedTask;
        }


        private Task ValidarCodFuncionOptimizadoAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadas, HashSet<string> hsFunciones)
        {
            var invalidos = mecanizadas.Select(m => m.Funcion).Distinct().Where(c => !hsFunciones.Contains(c));
            if (invalidos.Any())
            {
                var errores = invalidos.Select(c => new MEC_TMPErroresFuncion { IdCabecera = idCabecera, CodFuncion = c });
                _context.MEC_TMPErroresFuncion.AddRange(errores);
            }
            return Task.CompletedTask;
        }

        private Task ValidarCodLiquidacionOptimizadoAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadas, HashSet<string> hsConceptos)
        {
            var invalidos = mecanizadas.Select(m => m.CodigoLiquidacion).Distinct().Where(c => !hsConceptos.Contains(c));
            if (invalidos.Any())
            {
                var errores = invalidos.Select(c => new MEC_TMPErroresConceptos { IdCabecera = idCabecera, CodigoLiquidacion = c });
                _context.MEC_TMPErroresConceptos.AddRange(errores);
            }
            return Task.CompletedTask;
        }

        private Task ValidarCarRevistaOptimizadoAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadas, HashSet<string> hsCarRevista)
        {
            var invalidos = mecanizadas.Select(m => m.CaracterRevista).Distinct().Where(c => !hsCarRevista.Contains(c));
            if (invalidos.Any())
            {
                var errores = invalidos.Select(c => new MEC_TMPErroresCarRevista { IdCabecera = idCabecera, CaracterRevista = c });
                _context.MEC_TMPErroresCarRevista.AddRange(errores);
            }
            return Task.CompletedTask;
        }

        private Task ValidarTipoOrgOptimizadoAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadas, HashSet<string> hsTiposEstablecimientos)
        {
            var invalidos = mecanizadas.Select(m => m.TipoOrganizacion).Distinct().Where(c => !hsTiposEstablecimientos.Contains(c));
            if (invalidos.Any())
            {
                var errores = invalidos.Select(c => new MEC_TMPErroresTiposEstablecimientos { IdCabecera = idCabecera, TipoOrganizacion = c });
                _context.MEC_TMPErroresTiposEstablecimientos.AddRange(errores);
            }
            return Task.CompletedTask;
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

        private async Task ValidarNroEstabAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            var nroEstabInvalidos = mecanizadasFiltradas
                .Select(m => m.NroEstab)
                .Distinct()
                .Where(nro => !_context.MEC_Establecimientos.Any(e => e.NroDiegep == nro))
                .ToList();

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

        private async Task ValidarCodFuncionAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            var codFuncionInvalidos = mecanizadasFiltradas
                .Select(m => m.Funcion)
                .Distinct()
                .Where(cod => !_context.MEC_TiposFunciones.Any(f => f.CodFuncion == cod))
                .ToList();

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

        private async Task ValidarCodLiquidacionAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            var codLiquidacionInvalidos = mecanizadasFiltradas
                .Select(m => m.CodigoLiquidacion)
                .Distinct()
                .Where(cod => !_context.MEC_Conceptos.Any(f => f.CodConcepto == cod))
                .ToList();

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

        private async Task ValidarCarRevistaAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            var carRevistaInvalidos = mecanizadasFiltradas
                .Select(m => m.CaracterRevista)
                .Distinct()
                .Where(cod => !_context.MEC_CarRevista.Any(f => f.CodPcia == cod))
                .ToList();

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

        private async Task ValidarTipoOrgAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            var tipoOrgInvalidos = mecanizadasFiltradas
                .Select(m => m.TipoOrganizacion)
                .Distinct()
                .Where(cod => !_context.MEC_TiposEstablecimientos.Any(f => f.CodTipoEstablecimiento == cod))
                .ToList();

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

        public List<ErroresPOFDTO> ErroresPOFAgrupados()
        {
            var resultado = (from a in _context.MEC_TMPErroresMecanizadas
                             join e in _context.MEC_Establecimientos
                                 on a.IdEstablecimiento equals e.IdEstablecimiento
                             join m in _context.MEC_TMPMecanizadas
                                 on a.IdTMPMecanizada equals m.idTMPMecanizada
                             group new { e, m } by new { e.NroEstablecimiento, m.Documento, m.Secuencia } into g
                             orderby g.Key.NroEstablecimiento, g.Key.Documento, g.Key.Secuencia
                             select new ErroresPOFDTO
                             {
                                 Documento = g.Key.Documento,
                                 Secuencia = g.Key.Secuencia,
                                 NroEstablecimiento = g.Key.NroEstablecimiento
                             }).ToList();

            return resultado;
        }
        private async Task ValidarMecAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            // 1. Cargar datos que podemos en memoria
    var personas = await _context.MEC_Personas.AsNoTracking()
                       .ToDictionaryAsync(p => p.DNI);

    var establecimientos = await _context.MEC_Establecimientos.AsNoTracking()
                             .ToDictionaryAsync(e => e.NroDiegep);

    var pofs = await _context.MEC_POF.AsNoTracking().ToListAsync();
    var pofDict = pofs.GroupBy(p => (p.IdPersona, p.IdEstablecimiento, p.Secuencia))
                      .ToDictionary(g => g.Key, g => g.First());

    var cabecera = await _context.MEC_CabeceraLiquidacion
                         .AsNoTracking()
                         .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

    // 2. Listas para batch insert
    var detallesPOF = new List<MEC_POFDetalle>();
    var erroresMec = new List<MEC_TMPErroresMecanizadas>();

    // 3. Procesar registros en memoria
    foreach (var registro in mecanizadasFiltradas)
    {
        personas.TryGetValue(registro.Documento, out var persona);
        establecimientos.TryGetValue(registro.NroEstab, out var establecimiento);

        if (establecimiento == null)
        {
            // Si no hay establecimiento, continuar con el siguiente registro
            continue;
        }

        if (persona == null)
        {
            erroresMec.Add(new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = "NE",
                IdTMPMecanizada = registro.idTMPMecanizada,
                POF = "NE",
                IdEstablecimiento = establecimiento.IdEstablecimiento
            });
            registro.RegistroValido = "N";
            continue;
        }

        // Buscar POF en diccionario
        if (!pofDict.TryGetValue((persona.IdPersona, establecimiento.IdEstablecimiento, registro.Secuencia), out var pof))
        {
            erroresMec.Add(new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = "NE",
                IdTMPMecanizada = registro.idTMPMecanizada,
                POF = "NE",
                IdEstablecimiento = establecimiento.IdEstablecimiento
            });
            registro.RegistroValido = "N";
            continue;
        }

        // Procesar detalle
        var detalle = new MEC_POFDetalle
        {
            IdCabecera = idCabecera,
            IdPOF = pof.IdPOF,
            CantHorasCS = Convert.ToInt32(registro.HorasDesignadas ?? 0)
        };

        // ⚡ Consultar la antigüedad por persona (igual que en el código original)
        var antiguedad = await _context.MEC_POF_Antiguedades
                                       .AsNoTracking()
                                       .FirstOrDefaultAsync(a => a.IdPersona == persona.IdPersona);

        if (antiguedad != null)
        {
            var result = CalcularAntiguedad(
                ConvertirStringAIntNullable(cabecera?.MesLiquidacion),
                ConvertirStringAIntNullable(cabecera?.AnioLiquidacion),
                antiguedad.MesReferencia,
                antiguedad.AnioReferencia,
                antiguedad.AnioAntiguedad,
                antiguedad.MesAntiguedad
            );

            detalle.AntiguedadAnios = result.antiguedadAnios.GetValueOrDefault();
            detalle.AntiguedadMeses = result.antiguedadMeses.GetValueOrDefault();
        }

        detallesPOF.Add(detalle);
        registro.RegistroValido = "S";
    }

    // 4. Guardar todos los detalles y errores de una sola vez
    _context.MEC_POFDetalle.AddRange(detallesPOF);
    _context.MEC_TMPErroresMecanizadas.AddRange(erroresMec);
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

            return nuevoDetallePOF;
        }
        private async Task RegistroErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido, int? establecimiento)
        {
            // Aquí eliminamos el `SaveChangesAsync` dentro de este método
            if (_context.Entry(registro).State == EntityState.Detached)
            {
                _context.Attach(registro);
            }

            // Modificar el valor de 'RegistroValido' sin guardar inmediatamente
            registro.RegistroValido = registroValido;
            _context.Entry(registro).Property(x => x.RegistroValido).IsModified = true;

            // Obtener el establecimiento
            var estId = await _context.MEC_Establecimientos
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdEstablecimiento == establecimiento);



            // Crear nuevo registro de error mecanizado sin guardar inmediatamente
            _context.MEC_TMPErroresMecanizadas.Add(new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = documentoError,
                IdTMPMecanizada = registro.idTMPMecanizada,
                POF = pofError,
                IdEstablecimiento = estId.IdEstablecimiento,
            });
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

        public async Task<bool> VerificarTodosRegistrosValidosAsync(int idCabecera, List<MEC_TMPMecanizadas> mecanizadasFiltradas)
        {
            return mecanizadasFiltradas.All(m => m.RegistroValido == "S");
        }

        public async Task<string> ProcesarSiEsValidoAsync(int idCabecera, int usuario)
        {
            // 1. Usar AsNoTracking para la cabecera (operación de solo lectura)
            var cabeceras = await _context.MEC_CabeceraLiquidacion
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera)
                                        .ConfigureAwait(false);

            // 2. Filtrar registros MEC_TMPMecanizadas que coinciden en OrdenPago
            var mecanizadasFiltradas = await _context.MEC_TMPMecanizadas
                .Where(m => m.idCabecera == idCabecera && m.OrdenPago == cabeceras.OrdenPago)
                .ToListAsync()
                .ConfigureAwait(false);

            if (!mecanizadasFiltradas.Any())
            {
                throw new Exception("No se encontraron registros en MEC_TMPMecanizadas que coincidan con el OrdenPago de la cabecera.");
            }

            // Verificar si todos los registros son válidos
            bool todosValidos = await VerificarTodosRegistrosValidosAsync(idCabecera, mecanizadasFiltradas)
                .ConfigureAwait(false);

            if (!todosValidos) return "No todos los registros tienen RegistroValido = 'S'.";

            // Obtener registros de MEC_TMPMecanizadas (solo lectura)
            var registros = mecanizadasFiltradas;

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
                    if (!mecanizadas.Any(m => m.IdPOF == POF.IdPOF && m.CodigoLiquidacion == registro.CodigoLiquidacion))
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
                            CodigoLiquidacion = registro.CodigoLiquidacion,
                            Subvencion = registro.Subvencion,
                            Origen = "MEC",
                            Consolidado = "N",
                        });
                    }
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
