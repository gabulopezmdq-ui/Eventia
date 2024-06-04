using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class decima : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "EV_Obra",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Habilitado",
                table: "EV_Obra",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "EV_Maquina",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Habilitado",
                table: "EV_Maquina",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Obra_IdAdministacion",
                table: "EV_Obra",
                column: "IdAdministacion");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Obra_EV_Administracion_IdAdministacion",
                table: "EV_Obra",
                column: "IdAdministacion",
                principalTable: "EV_Administracion",
                principalColumn: "IdAdministracion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Obra_EV_Administracion_IdAdministacion",
                table: "EV_Obra");

            migrationBuilder.DropIndex(
                name: "IX_EV_Obra_IdAdministacion",
                table: "EV_Obra");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "EV_Obra");

            migrationBuilder.DropColumn(
                name: "Habilitado",
                table: "EV_Obra");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "EV_Maquina");

            migrationBuilder.DropColumn(
                name: "Habilitado",
                table: "EV_Maquina");
        }
    }
}
