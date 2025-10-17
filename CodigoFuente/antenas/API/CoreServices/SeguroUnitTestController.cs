using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
//using API.Controllers;
using API.DataSchema;
using API.Services;
using Xunit;

namespace CoreServices.Test { 
    public class SeguroUnitTestController
    {
    //    [Fact]
    //    public async void Get_ReturnsAllSeguros()
    //    {
    //        // Arrange
    //        var seguros = new List<EV_Seguro>
    //        {
    //            new EV_Seguro { IdSeguro = 1, Nombre = "Seguro1" },
    //            new EV_Seguro { IdSeguro = 2, Nombre = "Seguro2" },
    //            new EV_Seguro { IdSeguro = 3, Nombre = "Seguro3" },
    //            new EV_Seguro { IdSeguro = 4, Nombre = "Seguro4" },
    //            new EV_Seguro { IdSeguro = 5, Nombre = "Seguro5" },
    //        };

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.GetAll()).Returns(seguros);

    //        // Act
    //        var controller = new SeguroController(null, null, serviceMock.Object);
    //        var result = await controller.Get();

    //        // Assert
    //        result.Should().BeOfType<ActionResult<IEnumerable<EV_Seguro>>>();

    //        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
    //        var returnedSeguros = okResult.Value.Should().BeAssignableTo<IEnumerable<EV_Seguro>>().Subject;

    //        returnedSeguros.Should().HaveCount(5);
    //        returnedSeguros.Should().BeEquivalentTo(seguros);
    //    }

    //    [Fact]
    //    public async void GetById_ReturnsSeguro()
    //    {
    //        // Arrange
    //        var seguro = new EV_Seguro { IdSeguro = 4000, Nombre = "Seguro1" };

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.GetByID(1)).ReturnsAsync(seguro);

    //        var controller = new SeguroController(null, null, serviceMock.Object);

    //        // Act
    //        var result = await controller.Get(1);

    //        // Assert
    //        result.Should().BeOfType<ActionResult<EV_Seguro>>();

    //        var okObjectResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
    //        var actionResult = okObjectResult.Value.Should().BeAssignableTo<EV_Seguro>().Subject;

    //        actionResult.Should().BeEquivalentTo(seguro);
    //    }

    //    [Fact]
    //    public async void GetByName_ReturnsSeguro()
    //    {
    //        // Arrange
    //        var seguro = new EV_Seguro { IdSeguro = 1, Nombre = "Seguro1" };

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.GetByParam(It.IsAny<Expression<Func<EV_Seguro, bool>>>()))
    //            .ReturnsAsync(new List<EV_Seguro> { seguro });

    //        var controller = new SeguroController(null, null, serviceMock.Object);

    //        // Act
    //        var result = await controller.Get("Seguro1");

    //        // Assert
    //        var okObjectResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
    //        var actionResult = okObjectResult.Value.Should().BeAssignableTo<IEnumerable<EV_Seguro>>().Subject;

    //        actionResult.Should().HaveCount(1);
    //        actionResult.First().Should().BeEquivalentTo(seguro);
    //    }

    //    [Fact]
    //    public async void Post_CreatesSeguro()
    //    {
    //        // Arrange
    //        var newSeguro = new EV_Seguro { IdSeguro = 1, Nombre = "Seguro1" };

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.Add(newSeguro));

    //        var controller = new SeguroController(null, null, serviceMock.Object);

    //        // Act
    //        var result = await controller.Post(newSeguro);

    //        // Assert
    //        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
    //        var returnedSeguro = okResult.Value.Should().BeAssignableTo<EV_Seguro>().Subject;

    //        returnedSeguro.Should().BeEquivalentTo(newSeguro);
    //        serviceMock.Verify(s => s.Add(newSeguro), Times.Once);
    //    }

    //    [Fact]
    //    public async void Delete_RemovesSeguro()
    //    {
    //        // Arrange
    //        var seguroId = 1;

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.Delete(seguroId));

    //        var controller = new SeguroController(null, null, serviceMock.Object);

    //        // Act
    //        var result = await controller.Delete(seguroId);

    //        // Assert
    //        result.Should().BeOfType<OkResult>();
    //        serviceMock.Verify(s => s.Delete(seguroId), Times.Once);
    //    }

    //    [Fact]
    //    public async void Update_UpdatesSeguro()
    //    {
    //        // Arrange
    //        var seguro = new EV_Seguro { IdSeguro = 8000000, Nombre = "Seguro1" };

    //        var serviceMock = new Mock<ICRUDService<EV_Seguro>>();
    //        serviceMock.Setup(s => s.GetByParam(It.IsAny<Expression<Func<EV_Seguro, bool>>>()))
    //            .ReturnsAsync(new List<EV_Seguro> { seguro });

    //        var controller = new SeguroController(null, null, serviceMock.Object);

    //        // Act
    //        var result = await controller.Get("Seguro1");

    //        // Assert
    //        var okObjectResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
    //        var actionResult = okObjectResult.Value.Should().BeAssignableTo<IEnumerable<EV_Seguro>>().Subject;

    //        actionResult.Should().HaveCount(1);
    //        actionResult.First().Should().BeEquivalentTo(seguro);
    //    }
    }
}