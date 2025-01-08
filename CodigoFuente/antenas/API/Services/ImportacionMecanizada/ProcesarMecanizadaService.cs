using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using API.Services;
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
                throw new Exception("No se encontró la cabecera o no está en estado 'I'.");
            }

            await ValidarNroEstabAsync(idCabecera);
            await ValidarCodFuncionAsync(idCabecera);
            await ValidarCodLiquidacionAsync(idCabecera);
            await ValidarCarRevistaAsync(idCabecera);
            await ValidarTipoOrgAsync(idCabecera);

            if (await VerificarErroresAsync(idCabecera))
            {
                await EliminarRegistrosAsync(idCabecera);
                await CambiarEstadoCabeceraAsync(idCabecera, "P");
                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            await ValidarMecAsync(idCabecera);
        }

        private async Task<bool> VerificarErroresAsync(int idCabecera)
        {
            return await _context.MEC_TMPErroresEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera) ||
                   await _context.MEC_TMPErroresFuncion.AnyAsync(e => e.IdCabecera == idCabecera) ||
                   await _context.MEC_TMPErroresConceptos.AnyAsync(e => e.IdCabecera == idCabecera) ||
                   await _context.MEC_TMPErroresCarRevista.AnyAsync(e => e.IdCabecera == idCabecera) ||
                   await _context.MEC_TMPErroresTiposEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera);
        }

        private async Task EliminarRegistrosAsync(int idCabecera)
        {
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
            var nroEstabTMP = await _context.MEC_TMPMecanizadas
                                            .Where(m => m.idCabecera == idCabecera)
                                            .Select(m => m.NroEstab)
                                            .Distinct()
                                            .ToListAsync();

            var nroEstabInvalidos = nroEstabTMP.Where(nro =>
                !_context.MEC_Establecimientos.Any(e => e.NroDiegep == nro)).ToList();

            if (nroEstabInvalidos.Any())
            {
                var errores = nroEstabInvalidos.Select(nro => new MEC_TMPErroresEstablecimientos
                {
                    IdCabecera = idCabecera,
                    NroEstab = nro
                });

                await _context.MEC_TMPErroresEstablecimientos.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarCodFuncionAsync(int idCabecera)
        {
            var codFuncionTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.Funcion)
                                              .Distinct()
                                              .ToListAsync();

            var codFuncionInvalidos = codFuncionTMP.Where(cod =>
                !_context.MEC_TiposFunciones.Any(f => f.CodFuncion == cod)).ToList();

            if (codFuncionInvalidos.Any())
            {
                var errores = codFuncionInvalidos.Select(cod => new MEC_TMPErroresFuncion
                {
                    IdCabecera = idCabecera,
                    CodFuncion = cod
                });

                await _context.MEC_TMPErroresFuncion.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarCodLiquidacionAsync(int idCabecera)
        {
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

                await _context.MEC_TMPErroresConceptos.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarCarRevistaAsync(int idCabecera)
        {
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

                await _context.MEC_TMPErroresCarRevista.AddRangeAsync(errores);
                await _context.SaveChangesAsync();
            }
        }

        private async Task ValidarTipoOrgAsync(int idCabecera)
        {
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
                                            .FirstOrDefaultAsync(p => p.DNI == registro.Documento);

                if (persona == null)
                {
                    await RegistrarErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                var pof = await _context.MEC_POF
                                        .FirstOrDefaultAsync(p =>
                                            p.IdEstablecimiento == int.Parse(registro.NroEstab) &&
                                            p.IdPersona == persona.IdPersona &&
                                            p.Secuencia == registro.Secuencia);

                if (pof == null)
                {
                    await RegistrarErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                registro.RegistroValido = "S";
                await _context.SaveChangesAsync();
            }
        }

        private async Task RegistrarErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
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
    }
}
