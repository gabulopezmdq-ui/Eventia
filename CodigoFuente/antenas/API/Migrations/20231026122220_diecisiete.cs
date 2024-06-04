using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rsAPIElevador.Migrations
{
    /// <inheritdoc />
    public partial class diecisiete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_MaquinaEV_Velocidades");

            migrationBuilder.AddColumn<int>(
                name: "IdVelocidad",
                table: "EV_Maquina",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EV_Maquina_IdVelocidad",
                table: "EV_Maquina",
                column: "IdVelocidad");

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Velocidades_IdVelocidad",
                table: "EV_Maquina",
                column: "IdVelocidad",
                principalTable: "EV_Velocidades",
                principalColumn: "IdVelocidad");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Velocidades_IdVelocidad",
                table: "EV_Maquina");

            migrationBuilder.DropIndex(
                name: "IX_EV_Maquina_IdVelocidad",
                table: "EV_Maquina");

            migrationBuilder.DropColumn(
                name: "IdVelocidad",
                table: "EV_Maquina");

            migrationBuilder.CreateTable(
                name: "EV_MaquinaEV_Velocidades",
                columns: table => new
                {
                    EV_MaquinaIdMaquina = table.Column<int>(type: "integer", nullable: false),
                    EV_VelocidadesIdVelocidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_MaquinaEV_Velocidades", x => new { x.EV_MaquinaIdMaquina, x.EV_VelocidadesIdVelocidad });
                    table.ForeignKey(
                        name: "FK_EV_MaquinaEV_Velocidades_EV_Maquina_EV_MaquinaIdMaquina",
                        column: x => x.EV_MaquinaIdMaquina,
                        principalTable: "EV_Maquina",
                        principalColumn: "IdMaquina",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EV_MaquinaEV_Velocidades_EV_Velocidades_EV_VelocidadesIdVel~",
                        column: x => x.EV_VelocidadesIdVelocidad,
                        principalTable: "EV_Velocidades",
                        principalColumn: "IdVelocidad",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EV_MaquinaEV_Velocidades_EV_VelocidadesIdVelocidad",
                table: "EV_MaquinaEV_Velocidades",
                column: "EV_VelocidadesIdVelocidad");
        }
    }
}
