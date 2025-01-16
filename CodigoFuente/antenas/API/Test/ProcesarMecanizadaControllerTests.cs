using Moq;
using Xunit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using API.Controllers;
using API.Services;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DataSchema;
public class ProcesarMecanizadaControllerTests
{
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly Mock<IProcesarMecanizadaService<MEC_TMPMecanizadas>> _mockProcesarMecanizadaService;
    private readonly Mock<IImportacionMecanizadaService<MEC_TMPMecanizadas>> _mockImportacionMecanizadaService;
    private readonly Mock<ICRUDService<MEC_TMPMecanizadas>> _mockCRUDService;
    private readonly ImportarMecanizadasController _controller;

    public ProcesarMecanizadaControllerTests()
    {
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        _mockProcesarMecanizadaService = new Mock<IProcesarMecanizadaService<MEC_TMPMecanizadas>>(); // Asegúrate de usar el tipo adecuado aquí
        _mockImportacionMecanizadaService = new Mock<IImportacionMecanizadaService<MEC_TMPMecanizadas>>();
        _mockCRUDService = new Mock<ICRUDService<MEC_TMPMecanizadas>>();

        _controller = new ImportarMecanizadasController(
            _mockImportacionMecanizadaService.Object,
            _mockCRUDService.Object,
            _mockProcesarMecanizadaService.Object,
            _mockHttpContextAccessor.Object
        );
    }

    [Fact]
    public async Task ProcesarRegistros_DevuelveBadRequest_CuandoElResultadoEsInvalido()
    {
        // Arrange
        int idCabecera = 1;
        int usuarioId = 123;
        var claims = new[] { new Claim("id", usuarioId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        _mockHttpContextAccessor.Setup(h => h.HttpContext.User).Returns(user);
        _mockProcesarMecanizadaService.Setup(s => s.ProcesarSiEsValidoAsync(idCabecera, usuarioId))
            .ReturnsAsync("No es válido");

        // Act
        var result = await _controller.ProcesarRegistros(idCabecera);

        // Assert
        var actionResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("No es válido", actionResult.Value);
    }

    [Fact]
    public async Task ProcesarRegistros_DevuelveOk_CuandoElResultadoEsValido()
    {
        // Arrange
        int idCabecera = 1;
        int usuarioId = 123;
        var claims = new[] { new Claim("id", usuarioId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        _mockHttpContextAccessor.Setup(h => h.HttpContext.User).Returns(user);
        _mockProcesarMecanizadaService.Setup(s => s.ProcesarSiEsValidoAsync(idCabecera, usuarioId))
            .ReturnsAsync("Procesado con éxito");

        // Act
        var result = await _controller.ProcesarRegistros(idCabecera);

        // Assert
        var actionResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Procesado con éxito", actionResult.Value);
    }

    [Fact]
    public async Task ProcesarRegistros_DevuelveInternalServerError_CuandoSeLanzaUnaExcepcion()
    {
        // Arrange
        int idCabecera = 1;
        int usuarioId = 123;
        var claims = new[] { new Claim("id", usuarioId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        _mockHttpContextAccessor.Setup(h => h.HttpContext.User).Returns(user);
        _mockProcesarMecanizadaService.Setup(s => s.ProcesarSiEsValidoAsync(idCabecera, usuarioId))
            .ThrowsAsync(new Exception("Error en el procesamiento"));

        // Act
        var result = await _controller.ProcesarRegistros(idCabecera);

        // Assert
        var actionResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, actionResult.StatusCode);
        Assert.Equal("Error al procesar registros: Error en el procesamiento", actionResult.Value);
    }
}
