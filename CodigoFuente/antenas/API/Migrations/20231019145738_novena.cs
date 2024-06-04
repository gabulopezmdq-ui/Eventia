using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class novena : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_Persona");

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "EV_Velocidades",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "EV_TipoEquipamiento",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "EV_Seguro",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Habilitado",
                table: "EV_Seguro",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "EV_Maquina",
                columns: table => new
                {
                    IdMaquina = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdTipoMaquina = table.Column<int>(type: "integer", nullable: true),
                    IdVelocidadXMaquina = table.Column<int>(type: "integer", nullable: true),
                    CapacidadCarga = table.Column<string>(type: "text", nullable: true),
                    FechaFabricacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Metros = table.Column<int>(type: "integer", nullable: true),
                    Modelo = table.Column<string>(type: "text", nullable: true),
                    NroSerie = table.Column<string>(type: "text", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    Paradas = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Maquina", x => x.IdMaquina);
                });

            migrationBuilder.CreateTable(
                name: "EV_Obra",
                columns: table => new
                {
                    IdObra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    IdAdministacion = table.Column<int>(type: "integer", nullable: true),
                    IdTipoObra = table.Column<int>(type: "integer", nullable: true),
                    IdCalle = table.Column<int>(type: "integer", nullable: true),
                    Altura = table.Column<int>(type: "integer", nullable: true),
                    Expediente = table.Column<string>(type: "text", nullable: true),
                    FechaAct = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaIns = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaLibro = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Libro = table.Column<int>(type: "integer", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Obra", x => x.IdObra);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_Maquina");

            migrationBuilder.DropTable(
                name: "EV_Obra");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "EV_Velocidades");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "EV_TipoEquipamiento");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "EV_Seguro");

            migrationBuilder.DropColumn(
                name: "Habilitado",
                table: "EV_Seguro");

            migrationBuilder.CreateTable(
                name: "EV_Persona",
                columns: table => new
                {
                    IdPersona = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Persona", x => x.IdPersona);
                });
        }
    }
}
