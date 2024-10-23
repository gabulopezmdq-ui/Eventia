using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using OfficeOpenXml;
using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;

namespace API.Test
{
    public class ImportacionMecanizadaServiceTests
    {
        private readonly Mock<IFormFile> _mockFile;
        private readonly DbContextOptions<DataContext> _options;
        private readonly DataContext _context;

        public ImportacionMecanizadaServiceTests()
        {
            // Configurar la base de datos en memoria
            _options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new DataContext(_options);
            _mockFile = new Mock<IFormFile>();
        }

        [Fact]
        public async Task ImportarExcel_CorteEnProceso_SeManejaCorrectamente()
        {
            // Arrange
            var service = new ImportacionMecanizadaService<MEC_TMPMecanizadas>(_context);
            var excelContent = CreateExcelWithMockData(21); // Método que genera un archivo Excel simulado

            // Simular la carga del archivo
            _mockFile.Setup(f => f.Length).Returns(excelContent.Length);
            _mockFile.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(excelContent));
            _mockFile.Setup(f => f.FileName).Returns("test.xlsx");

            // Aquí lanzamos la excepción para simular un corte en el proceso
            var exceptionThrown = false;

            // Act
            try
            {
                await service.ImportarExcel(_mockFile.Object, 3);
            }
            catch (Exception ex) when (ex.Message == "Simulación de corte en la importación.")
            {
                exceptionThrown = true; // Capturamos si se lanzó la excepción esperada
            }

            // Assert
            Assert.True(exceptionThrown, "Se esperaba que se lanzara una excepción durante la importación.");

            // Verificar que no se hayan guardado registros en la base de datos
            var recordsCount = await _context.MEC_TMPMecanizadas.CountAsync();
            Assert.Equal(0, recordsCount);

            // Aquí podrías agregar más verificaciones relacionadas al estado de la cabecera de liquidación si es necesario
        }

        private byte[] CreateExcelWithMockData(int columnCount)
        {
            // Generar un archivo Excel en memoria para simular los datos de entrada
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Hoja1");
                // Agregar encabezados
                for (int i = 1; i <= columnCount; i++)
                {
                    worksheet.Cell(1, i).Value = $"Columna{i}";
                }
                // Agregar algunos datos simulados
                for (int row = 2; row <= 11; row++)
                {
                    for (int col = 1; col <= columnCount; col++)
                    {
                        worksheet.Cell(row, col).Value = $"Dato{row}-{col}";
                    }
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }
    }
}
