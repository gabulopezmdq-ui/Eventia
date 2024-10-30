using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using API.Migrations;

namespace API.Services
{
    public class ProcesarMecanizadaService : IProcesarMecanizadaService
    {
        private readonly DataContext _context;

        public ProcesarMecanizadaService(DataContext context) 
        {
            _context = context;
        }

        public async Task PreprocesarAsync(int idCabecera)
        {
            // Realizar todas las validaciones
            await ValidarNroEstabAsync(idCabecera);
            await ValidarCodFuncionAsync(idCabecera);
            await ValidarCodLiquidacionAsync(idCabecera);
            await ValidarCarRevistaAsync(idCabecera);
            await ValidarTipoOrgAsync(idCabecera);


            // Comprobar si hay errores en las tablas de validacion
            bool tieneErrores = await VerificarErroresAsync(idCabecera);

            if (tieneErrores)
            {
                // Eliminar registros en TMPMecanizadas para la cabecera
                await EliminarRegistrosAsync(idCabecera);

                // Cambiar el estado de la cabecera a "P"
                await CambiarEstadoCabeceraAsync(idCabecera, "P");

                throw new Exception("El archivo contiene errores. Debe corregir el archivo y volver a importarlo.");
            }

            // Validación de registros en TMPMecanizadas
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
            var registrosParaEliminar = await _context.MEC_TMPMecanizadas
                                                      .Where(m => m.idCabecera == idCabecera)
                                                      .ToListAsync();

            _context.MEC_TMPMecanizadas.RemoveRange(registrosParaEliminar);
            await _context.SaveChangesAsync();
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
            // Obtener todos los NroEstab para la cabecera en TMPMecanizadas
            var nroEstabTMP = await _context.MEC_TMPMecanizadas
                                            .Where(m => m.idCabecera == idCabecera)
                                            .Select(m => m.NroEstab)
                                            .Distinct()
                                            .ToListAsync();

            // Verificar la existencia en Establecimientos (NroDiegep)
            var nroEstabInvalidos = nroEstabTMP.Where(nro =>
                !_context.MEC_Establecimientos.Any(e => e.NroDiegep == nro)).ToList();

            // Insertar errores en TMP_ErroresEstablecimientos si hay NroEstab inválidos
            if (nroEstabInvalidos.Any())
            {
                var erroresEstablecimientos = nroEstabInvalidos.Select(nro => new MEC_TMPErroresEstablecimientos
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
            // Obtener todos los CodFuncion para la cabecera en TMPMecanizadas
            var codFuncionTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.Funcion)
                                              .Distinct()
                                              .ToListAsync();

            // Verificar la existencia en MEC_TiposFunciones
            var codFuncionInvalidos = codFuncionTMP.Where(cod =>
                !_context.MEC_TiposFunciones.Any(f => f.CodFuncion == cod)).ToList();

            // Insertar errores en TMP_ErroresFuncion si hay CodFuncion inválidos
            if (codFuncionInvalidos.Any())
            {
                var erroresFuncion = codFuncionInvalidos.Select(cod => new MEC_TMPErroresFuncion
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
            // Obtener todos los CodFuncion para la cabecera en TMPMecanizadas
            var codLiquidacionTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.CodigoLiquidacion)
                                              .Distinct()
                                              .ToListAsync();

            // Verificar la existencia en MEC_TiposConceptos
            var codLiquidacionInvalidos = codLiquidacionTMP.Where(cod =>
                !_context.MEC_Conceptos.Any(f => f.CodConcepto == cod)).ToList();

            // Insertar errores en TMP_ErroresFuncion si hay CodFuncion inválidos
            if (codLiquidacionInvalidos.Any())
            {
                var erroresConceptos = codLiquidacionInvalidos.Select(cod => new MEC_TMPErroresConceptos
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
            // Obtener todos los CarRevista para la cabecera en TMPMecanizadas
            var carRevistaTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.CaracterRevista)
                                              .Distinct()
                                              .ToListAsync();

            // Verificar la existencia en MEC_CarRevista
            var carRevistaInvalidos = carRevistaTMP.Where(cod =>
                !_context.MEC_CarRevista.Any(f => f.CodPcia == cod)).ToList();

            // Insertar errores en TMP_ErroresFuncion si hay CodFuncion inválidos
            if (carRevistaInvalidos.Any())
            {
                var erroresConceptos = carRevistaInvalidos.Select(cod => new MEC_TMPErroresCarRevista
                {
                    IdCabecera = idCabecera,
                    CaracterRevista = cod
                });

                await _context.MEC_TMPErroresCarRevista.AddRangeAsync(erroresConceptos);
                await _context.SaveChangesAsync();
            }
        }
        private async Task ValidarTipoOrgAsync(int idCabecera)
        {
            // Obtener todos los Tipo Organizacionpara la cabecera en TMPMecanizadas
            var tipoOrgTMP = await _context.MEC_TMPMecanizadas
                                              .Where(m => m.idCabecera == idCabecera)
                                              .Select(m => m.TipoOrganizacion)
                                              .Distinct()
                                              .ToListAsync();

            // Verificar la existencia en MEC_CarRevista
            var tipoOrgInvalidos = tipoOrgTMP.Where(cod =>
                !_context.MEC_TiposEstablecimientos.Any(f => f.CodTipoEstablecimiento == cod)).ToList();

            // Insertar errores en TMP_ErroresFuncion si hay CodFuncion inválidos
            if (tipoOrgInvalidos.Any())
            {   
                var erroresTipoOrg = tipoOrgInvalidos.Select(cod => new MEC_TMPErroresTiposEstablecimientos
                {
                    IdCabecera = idCabecera,
                    TipoOrganizacion = cod
                });

                await _context.MEC_TMPErroresTiposEstablecimientos.AddRangeAsync(erroresTipoOrg);
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
                string idEstablecimiento = registro.NroEstab;

                var persona = await _context.MEC_Personas
                                            .Where(x => x.DNI == registro.Documento)
                                            .FirstOrDefaultAsync();

                if (persona == null)
                {
                    await RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                int idPersona = persona.IdPersona;

                var POF = await _context.MEC_POF
                                        .Where(p => p.IdEstablecimiento == int.Parse(idEstablecimiento) &&
                                        p.IdPersona == idPersona &&
                                        p.Secuencia == registro.Secuencia)
                                        .FirstOrDefaultAsync();

                if (POF == null)
                {
                    await RegistroErrorMecAsync(idCabecera, registro, "NE", "NE", "N");
                    continue;
                }

                // Actualizar POF
                POF.IdCategoria = _context.MEC_TiposCategorias
                                          .Where(c => c.CodCategoria == registro.Categoria)
                                          .Select(c => c.IdTipoCategoria)
                                          .FirstOrDefault();

                POF.TipoCargo = registro.TipoCargo[0].ToString();
                POF.CantHsCargo = registro.TipoCargo.Substring(1);

                await _context.SaveChangesAsync();

                // Marcar el registro como válido
                registro.RegistroValido = "S";
            }
        }
        private async Task RegistroErrorMecAsync(int idCabecera, MEC_TMPMecanizadas registro, string documentoError, string pofError, string registroValido)
        {
            var error = new MEC_TMPErroresMecanizadas
            {
                IdCabecera = idCabecera,
                Documento = documentoError,
                POF = pofError,
            };

            _context.MEC_TMPErroresMecanizadas.Add(error);

            // Actualizar TMP_Mecanizadas
            registro.RegistroValido = registroValido;

            await _context.SaveChangesAsync();
        }
    }
}
