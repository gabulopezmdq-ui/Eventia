//using  API.DataSchema;
//using  API.Repositories;
//using Microsoft.EntityFrameworkCore;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Threading.Tasks;
using API.DataSchema;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using API.Migrations;
using System.Globalization;

namespace API.Services
{
    public class ImportacionMecanizadaService<T> : IImportacionMecanizadaService<T> where T : class
    {
        private readonly DataContext _context;

        public ImportacionMecanizadaService(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task ImportarExcel(IFormFile file, int idCabecera)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Archivo no proporcionado.");

            using (var stream = file.OpenReadStream())
            using (var reader = new StreamReader(stream))
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        while (!reader.EndOfStream)
                        {
                            var line = await reader.ReadLineAsync();
                            if (string.IsNullOrWhiteSpace(line)) continue;

                            // Parsear los campos de acuerdo a las posiciones
                            var mecanizada = new MEC_TMPMecanizadas
                            {
                                idCabecera = idCabecera,
                                FechaImportacion = DateTime.Now,
                                MesLiquidacion = line.Substring(0, 6).Trim(),
                                OrdenPago = line.Substring(6, 5).Trim(),
                                AnioMesAfectacion = line.Substring(11, 4).Trim(),
                                Documento = line.Substring(15, 8).Trim(),
                                Secuencia = line.Substring(23, 3).Trim(),
                                Funcion = line.Substring(26, 1).Trim(),
                                CodigoLiquidacion = line.Substring(27, 5).Trim(),
                                Importe = decimal.Parse(line.Substring(32, 8).Trim(), CultureInfo.InvariantCulture) / 100,
                                Signo = line.Substring(40, 1).Trim(),
                                MarcaTransferido = line.Substring(41, 1).Trim(),
                                Moneda = line.Substring(42, 1).Trim(),
                                RegimenEstatutario = line.Substring(43, 1).Trim(),
                                CaracterRevista = line.Substring(44, 1).Trim(),
                                Dependencia = line.Substring(45, 1).Trim(),
                                Distrito = line.Substring(46, 3).Trim(),
                                TipoOrganizacion = line.Substring(49, 2).Trim(),
                                NroEstab = line.Substring(51, 4).Trim(),
                                Categoria = line.Substring(55, 2).Trim(),
                                TipoCargo = line.Substring(57, 1).Trim(),
                                HorasDesignadas = decimal.Parse(line.Substring(58, 4).Trim(), CultureInfo.InvariantCulture) / 100,
                                Subvencion = line.Substring(62, 3).Trim(),
                                RegistroValido = "N"
                            };

                            // Agregar a la base de datos
                            _context.MEC_TMPMecanizadas.Add(mecanizada);
                        }

                        // Guardar todos los registros en la base de datos
                        await _context.SaveChangesAsync();

                        // Actualizar el estado de la cabecera a "I"
                        var cabecera = await _context.MEC_CabeceraLiquidacion.FindAsync(idCabecera);
                        if (cabecera != null)
                        {
                            cabecera.Estado = "I";
                            await _context.SaveChangesAsync();
                        }

                        // Confirmar la transacción
                        await transaction.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw new InvalidOperationException("Error en la importación de datos: " + ex.Message);
                    }
                }
            }
        }
        // Función ParseDecimal para convertir strings en decimales de forma segura. Algunos registros generaban errores porque los tomaba como un entero
        private decimal ParseDecimal(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return 0;

        // Quitar comas y espacios innecesarios
        value = value.Replace(",", "").Replace(" ", "");

        // Intentar convertir el valor a decimal
        if (decimal.TryParse(value, out decimal result))
            return result;

        throw new FormatException($"El valor '{value}' no tiene un formato decimal válido.");
    }

        //Revetir importación
        public async Task<List<MEC_TMPMecanizadas>> ObtenerRegistrosPorCabeceraAsync(int idCabecera)
        {
            // Filtrar los registros por idCabecera y estado "I"
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(m => m.idCabecera == idCabecera && m.Cabecera.Estado == "I")
                                          .ToListAsync();

            return registros;
        }
        public async Task RevertirImportacionAsync(int idCabecera)
        {
            // Buscar el estado en la tabla CabeceraDeLiquidacion
            var estadoCabecera = await _context.MEC_CabeceraLiquidacion
                                               .Where(c => c.IdCabecera == idCabecera)
                                               .FirstOrDefaultAsync();

            // Verificar que la cabecera exista y que el estado sea "I"
            if (estadoCabecera == null || estadoCabecera.Estado != "I")
            {
                throw new InvalidOperationException("No se encontraron registros con el estado 'I' para revertir.");
            }

            // Buscar y eliminar los registros si la confirmación es verdadera
            var registros = await _context.MEC_TMPMecanizadas
                                          .Where(m => m.idCabecera == idCabecera )
                                          .ToListAsync();

            if (!registros.Any())
            {
                throw new InvalidOperationException("No se encontraron registros para revertir.");
            }

            _context.MEC_TMPMecanizadas.RemoveRange(registros);

            // Cambiar el estado de la cabecera de "I" a "P"
             estadoCabecera.Estado = "P";

            // Guardar los cambios
            await _context.SaveChangesAsync();

            // Reiniciar los índices de la tabla MEC_TMPMecanizadas
            await _context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE MEC_TMPMecanizadas_id_seq RESTART WITH 1;");
        }

        private async Task EliminarTMPErrores(int idCabecera)
        {
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM ""MEC_TMPErroresEstablecimientos"" WHERE ""IdCabecera"" = {0};
                DELETE FROM ""MEC_TMPErroresFuncion"" WHERE ""IdCabecera"" = {0};
                DELETE FROM ""MEC_TMPErroresConceptos"" WHERE ""IdCabecera"" = {0};
                DELETE FROM ""MEC_TMPErroresCarRevista"" WHERE ""IdCabecera"" = {0};
                DELETE FROM ""MEC_TMPErroresTiposEstablecimientos"" WHERE ""IdCabecera"" = {0};
                DELETE FROM ""MEC_TMPErroresMecanizadas"" WHERE ""IdCabecera"" = {0};

                ALTER SEQUENCE ""MEC_TMPErroresEstablecimientos_IdTMPErrorEstablecimiento_seq"" RESTART WITH 1;
                ALTER SEQUENCE ""MEC_TMPErroresFuncion_IdTMPErrorFuncion_seq"" RESTART WITH 1;
                ALTER SEQUENCE ""MEC_TMPErroresConceptos_IdTMPErrorConcepto_seq"" RESTART WITH 1;
                ALTER SEQUENCE ""MEC_TMPErroresCarRevista_IdTMPErrorCarRevista_seq"" RESTART WITH 1;
                ALTER SEQUENCE ""MEC_TMPErroresTiposEstablecim_IdTMPErrorTipoEstablecimiento_seq"" RESTART WITH 1;
                ALTER SEQUENCE ""MEC_TMPErroresMecanizadas_IdTMPErrorMecanizada_seq"" RESTART WITH 1;
                ", idCabecera);
        }


    }
}
