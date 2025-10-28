using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class Cabecera : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MEC_CabeceraLiquidacion",
                columns: table => new
                {
                    IdCabecera = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    idTipoLiquidacion = table.Column<int>(type: "integer", nullable: false),
                    MesLiquidacion = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    AnioLiquidacion = table.Column<string>(type: "char(2)", fixedLength: true, nullable: true),
                    Usuario = table.Column<string>(type: "varchar(50)", fixedLength: true, nullable: false),
                    Observaciones = table.Column<string>(type: "varchar(1000)", fixedLength: true, nullable: false),
                    InicioLiquidacion = table.Column<DateTime>(type: "DateTime", fixedLength: true, nullable: false),
                    FinLiquidacion = table.Column<DateTime>(type: "DateTime", fixedLength: true, nullable: false),
                    Estado = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_CabeceraLiquidacion", x => x.IdCabecera);
                });

            migrationBuilder.CreateTable(
                name: "MEC_CarRevista",
                columns: table => new
                {
                    IdCarRevista = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CodPcia = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Descripcion = table.Column<string>(type: "varchar(50)", nullable: false),
                    CodMgp = table.Column<string>(type: "varchar(10)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_CarRevista", x => x.IdCarRevista);
                });

            migrationBuilder.CreateTable(
                name: "MEC_Conceptos",
                columns: table => new
                {
                    IdConcepto = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CodConcepto = table.Column<string>(type: "char(4)", fixedLength: true, nullable: false),
                    CodConceptoMgp = table.Column<string>(type: "varchar(10)", nullable: true),
                    Descripcion = table.Column<string>(type: "varchar(50)", nullable: false),
                    ConAporte = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Patronal = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_Conceptos", x => x.IdConcepto);
                });

            migrationBuilder.CreateTable(
                name: "MEC_POF",
                columns: table => new
                {
                    IdPOF = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEstablecimiento = table.Column<int>(type: "integer", nullable: false),
                    IdPersona = table.Column<int>(type: "integer", nullable: false),
                    Secuencia = table.Column<string>(type: "char(3)", fixedLength: true, nullable: false),
                    Barra = table.Column<string>(type: "char(2)", fixedLength: true, nullable: true),
                    IdCategoria = table.Column<int>(type: "integer", nullable: false),
                    TipoCargo = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    CantHsCargo = table.Column<string>(type: "char(4)", fixedLength: true, nullable: false),
                    AntigAnios = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    AntigMeses = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    SinHaberes = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Subvencionada = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_POF", x => x.IdPOF);
                });

            migrationBuilder.CreateTable(
                name: "MEC_TiposEstablecimientos",
                columns: table => new
                {
                    IdTipoEstablecimiento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CodTipoEstablecimiento = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    Descripcion = table.Column<string>(type: "varchar(50)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_TiposEstablecimientos", x => x.IdTipoEstablecimiento);
                });

            migrationBuilder.CreateTable(
                name: "MEC_TiposFunciones",
                columns: table => new
                {
                    IdTipoFuncion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CodFuncion = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false),
                    CodFuncionMGP = table.Column<string>(type: "varchar(10)", nullable: false),
                    Descripcion = table.Column<string>(type: "varchar(100)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_TiposFunciones", x => x.IdTipoFuncion);
                });

            migrationBuilder.CreateTable(
                name: "MEC_TiposLiquidaciones",
                columns: table => new
                {
                    IdTipoLiquidacion = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "varchar(100)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_TiposLiquidaciones", x => x.IdTipoLiquidacion);
                    table.ForeignKey(
                        name: "FK_MEC_TiposLiquidaciones_MEC_CabeceraLiquidacion_IdTipoLiquid~",
                        column: x => x.IdTipoLiquidacion,
                        principalTable: "MEC_CabeceraLiquidacion",
                        principalColumn: "IdCabecera",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MEC_Personas",
                columns: table => new
                {
                    IdPersona = table.Column<int>(type: "integer", nullable: false),
                    DNI = table.Column<string>(type: "char(8)", fixedLength: true, nullable: false),
                    Apellido = table.Column<string>(type: "varchar(100)", nullable: false),
                    Nombre = table.Column<string>(type: "varchar(100)", nullable: false),
                    Legajo = table.Column<string>(type: "varchar(10)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_Personas", x => x.IdPersona);
                    table.ForeignKey(
                        name: "FK_MEC_Personas_MEC_POF_IdPersona",
                        column: x => x.IdPersona,
                        principalTable: "MEC_POF",
                        principalColumn: "IdPOF",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MEC_TiposCategorias",
                columns: table => new
                {
                    IdTipoCategoria = table.Column<int>(type: "integer", nullable: false),
                    CodCategoria = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    CodCategoriaMGP = table.Column<string>(type: "varchar(10)", nullable: false),
                    Descripcion = table.Column<string>(type: "varchar(100)", nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_TiposCategorias", x => x.IdTipoCategoria);
                    table.ForeignKey(
                        name: "FK_MEC_TiposCategorias_MEC_POF_IdTipoCategoria",
                        column: x => x.IdTipoCategoria,
                        principalTable: "MEC_POF",
                        principalColumn: "IdPOF",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MEC_Establecimientos",
                columns: table => new
                {
                    IdEstablecimiento = table.Column<int>(type: "integer", nullable: false),
                    NroDiegep = table.Column<string>(type: "char(4)", fixedLength: true, nullable: false),
                    IdTipoEstablecimiento = table.Column<int>(type: "integer", nullable: false),
                    NroEstablecimiento = table.Column<string>(type: "varchar(50)", nullable: false),
                    NombreMgp = table.Column<string>(type: "varchar(100)", nullable: false),
                    NombrePcia = table.Column<string>(type: "varchar(100)", nullable: false),
                    Domicilio = table.Column<string>(type: "varchar(100)", nullable: false),
                    Telefono = table.Column<string>(type: "varchar(50)", nullable: false),
                    UE = table.Column<string>(type: "varchar(20)", nullable: false),
                    CantSecciones = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    CantTurnos = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    Ruralidad = table.Column<string>(type: "char(2)", fixedLength: true, nullable: false),
                    Subvencion = table.Column<string>(type: "char(3)", fixedLength: true, nullable: false),
                    Vigente = table.Column<string>(type: "char(1)", fixedLength: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEC_Establecimientos", x => x.IdEstablecimiento);
                    table.ForeignKey(
                        name: "FK_MEC_Establecimientos_MEC_POF_IdEstablecimiento",
                        column: x => x.IdEstablecimiento,
                        principalTable: "MEC_POF",
                        principalColumn: "IdPOF",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MEC_Establecimientos_MEC_TiposEstablecimientos_IdTipoEstabl~",
                        column: x => x.IdTipoEstablecimiento,
                        principalTable: "MEC_TiposEstablecimientos",
                        principalColumn: "IdTipoEstablecimiento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MEC_Establecimientos_IdTipoEstablecimiento",
                table: "MEC_Establecimientos",
                column: "IdTipoEstablecimiento");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MEC_CarRevista");

            migrationBuilder.DropTable(
                name: "MEC_Conceptos");

            migrationBuilder.DropTable(
                name: "MEC_Establecimientos");

            migrationBuilder.DropTable(
                name: "MEC_Personas");

            migrationBuilder.DropTable(
                name: "MEC_TiposCategorias");

            migrationBuilder.DropTable(
                name: "MEC_TiposFunciones");

            migrationBuilder.DropTable(
                name: "MEC_TiposLiquidaciones");

            migrationBuilder.DropTable(
                name: "MEC_TiposEstablecimientos");

            migrationBuilder.DropTable(
                name: "MEC_POF");

            migrationBuilder.DropTable(
                name: "MEC_CabeceraLiquidacion");
        }
    }
}
