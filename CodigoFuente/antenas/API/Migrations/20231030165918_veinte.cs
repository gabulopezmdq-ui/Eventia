using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace 
    Elevador.Migrations
{
    /// <inheritdoc />
    public partial class veinte : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Administracion_EV_Conservadora_IdConservadora",
                table: "EV_Administracion");

            migrationBuilder.DropIndex(
                name: "IX_EV_Administracion_IdConservadora",
                table: "EV_Administracion");

            migrationBuilder.DropColumn(
                name: "IdConservadora",
                table: "EV_Administracion");

            migrationBuilder.CreateTable(
                name: "EV_AdministracionEV_Conservadora",
                columns: table => new
                {
                    EV_AdministracionIdAdministracion = table.Column<int>(type: "integer", nullable: false),
                    EV_ConservadoraIdConservadora = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EV_AdministracionEV_Conservadora", x => new { x.EV_AdministracionIdAdministracion, x.EV_ConservadoraIdConservadora });
                    table.ForeignKey(
                        name: "FK_EV_AdministracionEV_Conservadora_EV_Administracion_EV_Admin~",
                        column: x => x.EV_AdministracionIdAdministracion,
                        principalTable: "EV_Administracion",
                        principalColumn: "IdAdministracion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EV_AdministracionEV_Conservadora_EV_Conservadora_EV_Conserv~",
                        column: x => x.EV_ConservadoraIdConservadora,
                        principalTable: "EV_Conservadora",
                        principalColumn: "IdConservadora",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EV_AdministracionEV_Conservadora_EV_ConservadoraIdConservad~",
                table: "EV_AdministracionEV_Conservadora",
                column: "EV_ConservadoraIdConservadora");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EV_AdministracionEV_Conservadora");

            migrationBuilder.AddColumn<int>(
                name: "IdConservadora",
                table: "EV_Administracion",
                type: "integer",
                nullable: true);

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
        }
    }
}
