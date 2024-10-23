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

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);

                    // Validación del número de columnas
                    if (worksheet.FirstRowUsed().LastCellUsed().Address.ColumnNumber != 21)
                    {
                        throw new ArgumentException("Formato incorrecto. El archivo debe tener exactamente 21 columnas.");
                    }

                    int totalRowsInExcel = worksheet.LastRowUsed().RowNumber(); // Número total de filas en el archivo
                    int totalRecordsSaved = 0;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            for (int row = 2; row <= totalRowsInExcel; row++)
                            {
                                var mecanizada = new MEC_TMPMecanizadas
                                {
                                    idCabecera = idCabecera,
                                    FechaImportacion = DateTime.Now,
                                    MesLiquidacion = worksheet.Cell(row, 1).GetString(),
                                    OrdenPago = worksheet.Cell(row, 2).GetString(),
                                    AnioMesAfectacion = worksheet.Cell(row, 3).GetString(),
                                    Documento = worksheet.Cell(row, 4).GetString(),
                                    Secuencia = worksheet.Cell(row, 5).GetString(),
                                    Funcion = worksheet.Cell(row, 6).GetString(),
                                    CodigoLiquidacion = worksheet.Cell(row, 7).GetString(),
                                    Importe = ParseDecimal(worksheet.Cell(row, 8).GetString()),
                                    Signo = worksheet.Cell(row, 9).GetString(),
                                    MarcaTransferido = worksheet.Cell(row, 10).GetString(),
                                    Moneda = worksheet.Cell(row, 11).GetString(),
                                    RegimenEstatutario = worksheet.Cell(row, 12).GetString(),
                                    CaracterRevista = worksheet.Cell(row, 13).GetString(),
                                    Dependencia = worksheet.Cell(row, 14).GetString(),
                                    Distrito = worksheet.Cell(row, 15).GetString(),
                                    TipoOrganizacion = worksheet.Cell(row, 16).GetString(),
                                    NroEstab = worksheet.Cell(row, 17).GetString(),
                                    Categoria = worksheet.Cell(row, 18).GetString(),
                                    TipoCargo = worksheet.Cell(row, 19).GetString(),
                                    HorasDesignadas = ParseDecimal(worksheet.Cell(row, 20).GetString()),
                                    Subvencion = worksheet.Cell(row, 21).GetString(),
                                    RegistroValido = "N"
                                };

                                _context.MEC_TMPMecanizadas.Add(mecanizada);
                                //totalRecordsSaved++;

                                //// Guardar los registros por tandas, por ejemplo, cada 100 registros. 
                                //if (totalRecordsSaved % 100 == 0)
                                //{
                                //    await _context.SaveChangesAsync();
                                //}
                            }

                            // Guardar todos los registros al final
                            await _context.SaveChangesAsync();

                            // Comprobar si todos los registros se guardaron. Esto es por si se guarda en tandas
                            //if (totalRecordsSaved != (totalRowsInExcel - 1)) // -1 porque no contamos la fila del header
                            //{
                            //    throw new InvalidOperationException("La importación se interrumpió y no se guardaron todos los registros.");
                            //}

                            // Actualizar el estado de la cabecera a "I"
                            var cabecera = await _context.MEC_CabeceraLiquidacion.FindAsync(idCabecera);
                            if (cabecera != null)
                            {
                                cabecera.Estado = "I";
                                await _context.SaveChangesAsync();
                            }

                            await transaction.CommitAsync(); // Confirmar la transacción

                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync(); // Revertir los cambios si ocurre un error
                            throw new InvalidOperationException("Error en la importación de datos: " + ex.Message);
                        }
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
    }
}
