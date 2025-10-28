using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class primerMigracion : Migration
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
                    CodMgp = table.Column<string>(type: "varchar(10)", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MEC_CarRevista");

            migrationBuilder.DropTable(
                name: "MEC_Conceptos");
        }
    }
}
