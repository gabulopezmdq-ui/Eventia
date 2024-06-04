using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace 
    Elevador.Migrations
{
    /// <inheritdoc />
    public partial class trece : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "IdObra",
                table: "EV_Maquina",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina",
                column: "IdMaquina",
                principalTable: "EV_Obra",
                principalColumn: "IdObra");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EV_Maquina_EV_Obra_IdMaquina",
                table: "EV_Maquina");

            migrationBuilder.DropColumn(
                name: "IdObra",
                table: "EV_Maquina");

            migrationBuilder.AlterColumn<int>(
                name: "IdMaquina",
                table: "EV_Maquina",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);
        }
    }
}
