using Microsoft.EntityFrameworkCore.Migrations;

namespace API.Migrations
{
    public partial class updateInspecciones : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdLeyenda",
                table: "ANT_Inspecciones");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdLeyenda",
                table: "ANT_Inspecciones",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}