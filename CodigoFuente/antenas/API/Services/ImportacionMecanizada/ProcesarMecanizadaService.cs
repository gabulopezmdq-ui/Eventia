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

            // Comprobar si hay errores
            var tieneErrores = await _context.MEC_TMPErroresEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera) ||
                               await _context.MEC_TMPErroresFuncion.AnyAsync(e => e.IdCabecera == idCabecera) ||
                               await _context.MEC_TMPErroresConceptos.AnyAsync(e => e.IdCabecera == idCabecera) ||
                               await _context.MEC_TMPErroresCarRevista.AnyAsync(e => e.IdCabecera == idCabecera) ||
                               await _context.MEC_TMPErroresTiposEstablecimientos.AnyAsync(e => e.IdCabecera == idCabecera);

            if (tieneErrores)
            {
                // Borrar los registros de TMPMecanizadas para la cabecera en cuestión
                var registrosParaEliminar = await _context.MEC_TMPMecanizadas
                    .Where(m => m.idCabecera == idCabecera)
                    .ToListAsync();

                _context.MEC_TMPMecanizadas.RemoveRange(registrosParaEliminar);
                await _context.SaveChangesAsync();

                // Mostrar un mensaje indicando que hay errores
                // Aquí puedes lanzar una excepción o retornar un objeto de respuesta que contenga los errores
                throw new Exception("El archivo contiene errores y/o registros no encontrados en las tablas paramétricas. Debe corregir el archivo y volver a importarlo.");

                // Si tienes un modelo para manejar la cabecera de estados:
                var estadoCabecera = new MEC_CabeceraLiquidacion
                {
                    //IdCabecera = idCabecera,
                    //Fecha = DateTime.UtcNow,
                    //Usuario = "usuario", // Aquí deberías obtener el usuario actual
                    //Estado = "P", // Pendiente de Importación
                    //Observaciones = "Archivo contiene errores – Se deberá corregir y volver a importar"
                };

                await _context.MEC_CabeceraLiquidacion.AddAsync(estadoCabecera);
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
    }
}
