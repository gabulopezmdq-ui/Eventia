using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class quince : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdObra",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina");

            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "IdSeguro",
                table: "EV_Conservadora",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Conservadora_IdSeguro",
                table: "EV_Conservadora",
                column: "IdSeguro");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Conservadora_EV_Seguro_IdSeguro",
                table: "EV_Conservadora",
                column: "IdSeguro",
                principalTable: "EV_Seguro",
                principalColumn: "IdSeguro");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina",
                column: "IdMaquina",
                principalTable: "EV_Obra",
                principalColumn: "IdObra");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Conservadora_EV_Seguro_IdSeguro",
                table: "EV_Conservadora");

            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Conservadora_IdSeguro",
                table: "EV_Conservadora");

            migrationBuilder.DropColumn(
                name: "IdSeguro",
                table: "EV_Conservadora");

            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina",
                column: "IdObra");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdObra",
                table: "EV_Maquina",
                column: "IdObra",
                principalTable: "EV_Obra",
                principalColumn: "IdObra");
        }
    }
}
