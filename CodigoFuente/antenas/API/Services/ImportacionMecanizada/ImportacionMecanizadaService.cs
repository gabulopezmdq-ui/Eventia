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
using OfficeOpenXml;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public class ImportacionMecanizadaService<T> : IImportacionMecanizadaService<T> where T : class
    {
        private readonly DataContext _context;

        public ImportacionMecanizadaService(DataContext context)
        {
            _context = context;
        }

        public async Task ImportarExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Archivo no proporcionado.");

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                    {
                        var mecanizada = new MEC_TMPMecanizadas
                        {
                            //idCabecera = ver como traer el id del combo del frontend
                            FechaImportacion = DateTime.Now,
                            MesLiquidacion = worksheet.Cells[row, 1].Text,
                            OrdenPago = worksheet.Cells[row, 2].Text,
                            AnioMesAfectacion = worksheet.Cells[row, 3].Text,
                            Documento = worksheet.Cells[row, 4].Text,
                            Secuencia = worksheet.Cells[row, 5].Text,
                            Funcion = worksheet.Cells[row, 6].Text,
                            CodigoLiquidacion = worksheet.Cells[row, 7].Text,
                            Importe = decimal.Parse(worksheet.Cells[row, 8].Text),
                            Signo = worksheet.Cells[row, 9].Text,
                            MarcaTransferido = worksheet.Cells[row, 10].Text,
                            Moneda = worksheet.Cells[row, 11].Text,
                            RegimenEstatutario = worksheet.Cells[row, 12].Text,
                            CaracterRevista = worksheet.Cells[row, 13].Text,
                            Dependencia = worksheet.Cells[row, 14].Text,
                            Distrito = worksheet.Cells[row, 15].Text,
                            TipoOrganizacion = worksheet.Cells[row, 16].Text,
                            NroEstab = worksheet.Cells[row, 17].Text,
                            Categoria = worksheet.Cells[row, 18].Text,
                            TipoCargo = worksheet.Cells[row, 19].Text,
                            HorasDesignadas = decimal.Parse(worksheet.Cells[row, 20].Text),
                            Subvencion = worksheet.Cells[row, 21].Text,
                            RegistroValido = "N"
                        };

                        _context.MEC_TMPMecanizadas.Add(mecanizada);
                    }
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}