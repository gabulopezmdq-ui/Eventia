using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class once : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
