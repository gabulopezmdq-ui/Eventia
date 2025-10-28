using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class segundaMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "MEC_Establecimientos",
                columns: table => new
                {
                    IdEstablecimiento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
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
                name: "MEC_TiposEstablecimientos");
        }
    }
}
