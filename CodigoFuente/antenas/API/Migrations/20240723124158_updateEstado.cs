using Microsoft.EntityFrameworkCore.Migrations;

namespace API.Migrations
{
    public partial class updateEstado : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdEstadoTramite",
                table: "ANT_Expedientes",
                nullable: false, // No permite valores NULL
                defaultValue: 0); //establece por defecto el valor 0;
        }
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdEstadoTramite",
                table: "ANT_Expedientes");
        }
    }
}