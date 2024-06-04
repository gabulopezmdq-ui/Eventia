using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class sexta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EJ_Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EJ_Usuarios", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "EV_Administracion",
                columns: table => new
                {
                    IdAdministracion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    Altura = table.Column<int>(type: "integer", nullable: false),
                    Dto = table.Column<string>(type: "text", nullable: false),
                    FechaAct = table.Column<int>(type: "integer", nullable: false),
                    Habilitado = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdCalle = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Administracion", x => x.IdAdministracion);
                });

            migrationBuilder.CreateTable(
                name: "EV_RepTecnico",
                columns: table => new
                {
                    IdRepTecnico = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    Altura = table.Column<int>(type: "integer", nullable: false),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FechaAct = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Habilitado = table.Column<bool>(type: "boolean", nullable: false),
                    IdCalle = table.Column<int>(type: "integer", nullable: false),
                    MatMuni = table.Column<string>(type: "text", nullable: false),
                    MatProf = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_RepTecnico", x => x.IdRepTecnico);
                });

            migrationBuilder.CreateTable(
                name: "EV_Seguro",
                columns: table => new
                {
                    IdSeguro = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Altura = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdCalle = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    NroPoliza = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Seguro", x => x.IdSeguro);
                });

            migrationBuilder.CreateTable(
                name: "EV_TipoEquipamiento",
                columns: table => new
                {
                    IdTipoEquipamiento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    FechaAct = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_TipoEquipamiento", x => x.IdTipoEquipamiento);
                });

            migrationBuilder.CreateTable(
                name: "EV_TipoObra",
                columns: table => new
                {
                    IdTipoObra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    FechaAct = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_TipoObra", x => x.IdTipoObra);
                });

            migrationBuilder.CreateTable(
                name: "EV_Velocidades",
                columns: table => new
                {
                    IdVelocidad = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    FechaAct = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_Velocidades", x => x.IdVelocidad);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EJ_Usuarios");

            migrationBuilder.DropTable(
                name: "EV_Administracion");

            migrationBuilder.DropTable(
                name: "EV_RepTecnico");

            migrationBuilder.DropTable(
                name: "EV_Seguro");

            migrationBuilder.DropTable(
                name: "EV_TipoEquipamiento");

            migrationBuilder.DropTable(
                name: "EV_TipoObra");

            migrationBuilder.DropTable(
                name: "EV_Velocidades");
        }
    }
}
