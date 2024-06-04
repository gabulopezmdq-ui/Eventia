using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace 
    Elevador.Migrations
{
    /// <inheritdoc />
    public partial class catorce : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina");

            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "IdConservadora",
                table: "EV_Maquina",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdConservadora",
                table: "EV_Maquina",
                column: "IdConservadora");

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina",
                column: "IdObra");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Conservadora_IdConservadora",
                table: "EV_Maquina",
                column: "IdConservadora",
                principalTable: "EV_Conservadora",
                principalColumn: "IdConservadora");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdObra",
                table: "EV_Maquina",
                column: "IdObra",
                principalTable: "EV_Obra",
                principalColumn: "IdObra");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Conservadora_IdConservadora",
                table: "EV_Maquina");

            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdObra",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdConservadora",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina");

            migrationBuilder.DropColumn(
                name: "IdConservadora",
                table: "EV_Maquina");

            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina",
                column: "IdMaquina",
                principalTable: "EV_Obra",
                principalColumn: "IdObra");
        }
    }
}
