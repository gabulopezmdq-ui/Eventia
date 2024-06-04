using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace 
    Elevador.Migrations
{
    /// <inheritdoc />
    public partial class diecinueve : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "IdConservadora",
                table: "EV_Administracion",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "EV_ConservadoraEV_RepTecnico",
                columns: table => new
                {
                    EV_ConservadoraIdConservadora = table.Column<int>(type: "integer", nullable: false),
                    EV_RepTecnicoIdRepTecnico = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_ConservadoraEV_RepTecnico", x => new { x.EV_ConservadoraIdConservadora, x.EV_RepTecnicoIdRepTecnico });
                    table.ForeignKey(
                        name: "FK_EV_ConservadoraEV_RepTecnico_EV_Conservadora_EV_Conservador~",
                        column: x => x.EV_ConservadoraIdConservadora,
                        principalTable: "EV_Conservadora",
                        principalColumn: "IdConservadora",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EV_ConservadoraEV_RepTecnico_EV_RepTecnico_EV_RepTecnicoIdR~",
                        column: x => x.EV_RepTecnicoIdRepTecnico,
                        principalTable: "EV_RepTecnico",
                        principalColumn: "IdRepTecnico",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EV_ConservadoraEV_RepTecnico_EV_RepTecnicoIdRepTecnico",
                table: "EV_ConservadoraEV_RepTecnico",
                column: "EV_RepTecnicoIdRepTecnico");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_ConservadoraEV_RepTecnico");

            migrationBuilder.AlterColumn<int>(
                name: "IdConservadora",
                table: "EV_Administracion",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
