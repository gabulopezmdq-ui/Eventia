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

        public ProcesarMecanizadaService(DataContext context) // Cambiar el nombre aquí para que coincida con el nombre de la clase
        {
            _context = context;
        }

        public async Task PreprocesarAsync(int idCabecera)
        {
            // Validar NroEstab y agregar errores a TMP_ErroresEstablecimientos
            await ValidarNroEstabAsync(idCabecera);

            // Validar CodFuncion y agregar errores a TMP_ErroresFuncion
            await ValidarCodFuncionAsync(idCabecera);

            await ValidarCodLiquidacionAsync(idCabecera);
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
    }
}
