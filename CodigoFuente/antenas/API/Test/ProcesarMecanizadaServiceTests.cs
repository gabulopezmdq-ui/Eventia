using Moq;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using API.DataSchema;
using API.Services;
using System.Collections.Generic;

public class ProcesarMecanizadaServiceTests
{
    [Fact]
    public async Task PreprocesarAsync_ShouldWorkSuccessfully_WhenValidDataProvided()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        // Crear el contexto en memoria
        using var mockContext = new DataContext(options);

        // Datos de prueba
        var cabecera = new MEC_CabeceraLiquidacion
        {
            IdCabecera = 1,
            Estado = "I",
            MesLiquidacion = "1", // Inicializa el mes correspondiente
            Observaciones = "Test Observaciones", // Establece un valor de prueba
            Vigente = "S" // Establece si está vigente
        };

        var tmpMecanizadas = new List<MEC_TMPMecanizadas>
    {
        new MEC_TMPMecanizadas
        {
            idCabecera = 1,
            NroEstab = "123",
            Documento = "12345678",
            Secuencia = "A",
            Categoria = "CAT1",
            TipoCargo = "X",
            AnioMesAfectacion = "202311",
            CaracterRevista = "Titular",
            CodigoLiquidacion = "ABC123",
            Dependencia = "01",
            Distrito = "1",
            Funcion = "Profesor",
            HorasDesignadas = 40,
            MarcaTransferido = "N",
            Moneda = "ARS",
            OrdenPago = "OP001",
            RegimenEstatutario = "R1",
            RegistroValido = "S",
            Signo = "+",
            Subvencion = "Total",
            TipoOrganizacion = "Escuela"
        }
    };

        // Agregar los datos al contexto en memoria
        mockContext.MEC_CabeceraLiquidacion.Add(cabecera);
        mockContext.MEC_TMPMecanizadas.AddRange(tmpMecanizadas);
        await mockContext.SaveChangesAsync();

        // Crear el servicio con el contexto en memoria
        var service = new ProcesarMecanizadaService(mockContext);

        // Act
        await service.PreprocesarAsync(1);

        // Assert
        var updatedCabecera = await mockContext.MEC_CabeceraLiquidacion.FindAsync(1);
        Assert.NotNull(updatedCabecera);
        Assert.Equal("Procesado", updatedCabecera.Estado); // Ajusta el estado esperado según la lógica
    }

}
