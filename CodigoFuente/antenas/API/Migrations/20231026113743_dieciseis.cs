using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace 
    Elevador.Migrations
{
    /// <inheritdoc />
    public partial class dieciseis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_MaquinaEV_Velocidades");
        }
    }
}
