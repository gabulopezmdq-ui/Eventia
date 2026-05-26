using System;
using System.Threading.Tasks;
using API.DataSchema;
using API.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CoreServices.Test
{
    public class MiEventiaServiceTests
    {
        private DataContext GetInMemoryDataContext()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new DataContext(options);
        }

        [Fact]
        public async Task VincularAccesoAsync_CreaPersonaYAcceso_CuandoNoExisten()
        {
            // Arrange
            using var context = GetInMemoryDataContext();
            var service = new MiEventiaService(context);

            var tokenConsulta = "test-token-consulta-1";
            var email = "padre1@eventia.com";
            var telefono = "+549223123456";

            // Act
            var tokenPortal = await service.VincularAccesoAsync(
                nombre: "Juan Perez",
                email: email,
                telefono: telefono,
                tipo: "PROGRAMA",
                idEvento: 10,
                idInscripcion: 100,
                idInvitado: null,
                tokenConsulta: tokenConsulta,
                titulo: "Colonia de Verano 2026",
                estado: "ACTIVO"
            );

            // Assert
            tokenPortal.Should().NotBeEmpty();

            // Verificar que se haya creado la persona
            var persona = await context.PortalPersonas.FirstOrDefaultAsync(p => p.Email == email);
            persona.Should().NotBeNull();
            persona!.Nombre.Should().Be("Juan Perez");
            persona.Telefono.Should().Be(telefono);
            persona.TokenPortal.Should().Be(tokenPortal);

            // Verificar que se haya creado el acceso
            var acceso = await context.PortalAccesos.FirstOrDefaultAsync(a => a.TokenConsulta == tokenConsulta);
            acceso.Should().NotBeNull();
            acceso!.IdPortalPersona.Should().Be(persona.IdPortalPersona);
            acceso.Tipo.Should().Be(AccesoTipo.PROGRAMA);
            acceso.IdEvento.Should().Be(10);
            acceso.IdInscripcion.Should().Be(100);
            acceso.TituloOverride.Should().Be("Colonia de Verano 2026");
        }

        [Fact]
        public async Task VincularAccesoAsync_ReutilizaPersona_CuandoYaExistePorEmail()
        {
            // Arrange
            using var context = GetInMemoryDataContext();
            var service = new MiEventiaService(context);

            var email = "padre_compartido@eventia.com";
            var personaExistente = new PortalPersona
            {
                Nombre = "Persona Existente",
                Email = email,
                Telefono = "+549223111111",
                TokenPortal = Guid.NewGuid(),
                Activo = true
            };
            context.PortalPersonas.Add(personaExistente);
            await context.SaveChangesAsync();

            var tokenConsulta = "nuevo-token-consulta-2";

            // Act
            var tokenPortal = await service.VincularAccesoAsync(
                nombre: "Persona Existente Mod",
                email: email,
                telefono: "+549223111111",
                tipo: "EVENTO",
                idEvento: 11,
                idInscripcion: 101,
                idInvitado: null,
                tokenConsulta: tokenConsulta,
                titulo: "Evento Familiar 2026",
                estado: "ACTIVO"
            );

            // Assert
            tokenPortal.Should().Be(personaExistente.TokenPortal);

            // Verificar que no se creó otra persona
            var countPersonas = await context.PortalPersonas.CountAsync();
            countPersonas.Should().Be(1);

            // Verificar que se haya creado el acceso asociado a la misma persona
            var acceso = await context.PortalAccesos.FirstOrDefaultAsync(a => a.TokenConsulta == tokenConsulta);
            acceso.Should().NotBeNull();
            acceso!.IdPortalPersona.Should().Be(personaExistente.IdPortalPersona);
            acceso.Tipo.Should().Be(AccesoTipo.EVENTO);
        }

        [Fact]
        public async Task VincularAccesoAsync_EsIdempotente_CuandoSeLlamaMultiplesVecesConMismoAcceso()
        {
            // Arrange
            using var context = GetInMemoryDataContext();
            var service = new MiEventiaService(context);

            var tokenConsulta = "token-unico-consulta";
            var email = "padre_idempotente@eventia.com";

            // Act
            var token1 = await service.VincularAccesoAsync(
                nombre: "Juan Perez",
                email: email,
                telefono: "+549223999999",
                tipo: "PROGRAMA",
                idEvento: 20,
                idInscripcion: 200,
                idInvitado: null,
                tokenConsulta: tokenConsulta,
                titulo: "Programa Test",
                estado: "ACTIVO"
            );

            var token2 = await service.VincularAccesoAsync(
                nombre: "Juan Perez",
                email: email,
                telefono: "+549223999999",
                tipo: "PROGRAMA",
                idEvento: 20,
                idInscripcion: 200,
                idInvitado: null,
                tokenConsulta: tokenConsulta,
                titulo: "Programa Test",
                estado: "ACTIVO"
            );

            // Assert
            token1.Should().Be(token2);

            var personasCount = await context.PortalPersonas.CountAsync();
            var accesosCount = await context.PortalAccesos.CountAsync();

            personasCount.Should().Be(1);
            accesosCount.Should().Be(1);
        }
    }
}
