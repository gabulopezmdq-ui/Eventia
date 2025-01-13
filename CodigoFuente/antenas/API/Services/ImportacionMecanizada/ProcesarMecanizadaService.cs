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
                                          .FirstOrDefaultAsync(c => c.IdCabecera == idCabecera);

            if (cabecera == null || cabecera.Estado != "I")
            {
                throw new Exception("La cabecera no existe o no está en estado 'I'.");
            }

            await ValidarDatosCabeceraAsync(idCabecera);
            bool tieneErrores = await VerificarErroresAsync(idCabecera);

            if (tieneErrores)
            {
                await EliminarRegistrosAsync(idCabecera);
                await CambiarEstadoCabeceraAsync(idCabecera, "P");
                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            await ValidarMecAsync(idCabecera);
        }

        private async Task ValidarDatosCabeceraAsync(int idCabecera)
        {
            await Task.WhenAll(
                ValidarNroEstabAsync(idCabecera),
                ValidarCodFuncionAsync(idCabecera),
                ValidarCodLiquidacionAsync(idCabecera),
                ValidarCarRevistaAsync(idCabecera),
                ValidarTipoOrgAsync(idCabecera)
            );
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

                await _context.MEC_TMPErroresEstablecimientos.AddRangeAsync(erroresEstablecimientos);
                await _context.SaveChangesAsync();
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

                await _context.MEC_TMPErroresFuncion.AddRangeAsync(erroresFuncion);
                await _context.SaveChangesAsync();
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

                await _context.MEC_TMPErroresConceptos.AddRangeAsync(erroresConceptos);
                await _context.SaveChangesAsync();
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

                await _context.MEC_TMPErroresCarRevista.AddRangeAsync(erroresCarRevista);
                await _context.SaveChangesAsync();
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
                                            .FirstOrDefaultAsync(x => x.DNI == registro.Documento);

                if (persona == null)
                {
                    await RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                var POF = await _context.MEC_POF
                                         .FirstOrDefaultAsync(p => p.IdEstablecimiento == int.Parse(registro.NroEstab) &&
                                                                   p.IdPersona == persona.IdPersona &&
                                                                   p.Secuencia == registro.Secuencia);

                if (POF == null)
                {
                    await RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                await ProcesarDetallePOFAsync(idCabecera, POF, registro);
                registro.RegistroValido = "S";
            }
        }

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
            }

            await _context.SaveChangesAsync();
        }

        private async Task RegistroErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
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
    }
}
