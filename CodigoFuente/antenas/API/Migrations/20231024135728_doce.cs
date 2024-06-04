using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class doce : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_TipoEquipamiento_EV_TipoEquipamientoIdTipoEqu~",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_EV_TipoEquipamientoIdTipoEquipamiento",
                table: "EV_Maquina");

            migrationBuilder.DropColumn(
                name: "EV_TipoEquipamientoIdTipoEquipamiento",
                table: "EV_Maquina");

            migrationBuilder.RenameColumn(
                name: "IdTipoMaquina",
                table: "EV_Maquina",
                newName: "IdTipoEquipamiento");

            migrationBuilder.CreateIndex(
                name: "IX_EV_Obra_IdTipoObra",
                table: "EV_Obra",
                column: "IdTipoObra");

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdTipoEquipamiento",
                table: "EV_Maquina",
                column: "IdTipoEquipamiento");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_TipoEquipamiento_IdTipoEquipamiento",
                table: "EV_Maquina",
                column: "IdTipoEquipamiento",
                principalTable: "EV_TipoEquipamiento",
                principalColumn: "IdTipoEquipamiento");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Obra_EV_TipoObra_IdTipoObra",
                table: "EV_Obra",
                column: "IdTipoObra",
                principalTable: "EV_TipoObra",
                principalColumn: "IdTipoObra");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_TipoEquipamiento_IdTipoEquipamiento",
                table: "EV_Maquina");

            migrationBuilder.DropForeignKey(
                name: "FK_EV_Obra_EV_TipoObra_IdTipoObra",
                table: "EV_Obra");

            migrationBuilder.DropIndex(
                name: "IX_EV_Obra_IdTipoObra",
                table: "EV_Obra");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdTipoEquipamiento",
                table: "EV_Maquina");

            migrationBuilder.RenameColumn(
                name: "IdTipoEquipamiento",
                table: "EV_Maquina",
                newName: "IdTipoMaquina");

            migrationBuilder.AddColumn<int>(
                name: "EV_TipoEquipamientoIdTipoEquipamiento",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_EV_TipoEquipamientoIdTipoEquipamiento",
                table: "EV_Maquina",
                column: "EV_TipoEquipamientoIdTipoEquipamiento");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_TipoEquipamiento_EV_TipoEquipamientoIdTipoEqu~",
                table: "EV_Maquina",
                column: "EV_TipoEquipamientoIdTipoEquipamiento",
                principalTable: "EV_TipoEquipamiento",
                principalColumn: "IdTipoEquipamiento",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
