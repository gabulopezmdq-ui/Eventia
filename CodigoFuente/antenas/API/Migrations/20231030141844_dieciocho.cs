using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class dieciocho : Migration
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
                table: "EV_Administracion",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina",
                column: "IdObra");

            migrationBuilder.CreateIndex(
                name: "IX_EV_Administracion_IdConservadora",
                table: "EV_Administracion",
                column: "IdConservadora");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Administracion_EV_Conservadora_IdConservadora",
                table: "EV_Administracion",
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
                name: "FK_EV_Administracion_EV_Conservadora_IdConservadora",
                table: "EV_Administracion");

            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdObra",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdObra",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Administracion_IdConservadora",
                table: "EV_Administracion");

            migrationBuilder.DropColumn(
                name: "IdConservadora",
                table: "EV_Administracion");

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
