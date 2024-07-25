using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ModifyDatetime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaEmision",
                table: "ANT_Expedientes",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaTasaA",
                table: "ANT_Expedientes",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaEmision",
                table: "ANT_Expedientes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(0),
                oldClrType: typeof(DateTime?),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaTasaA",
                table: "ANT_Expedientes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(0),
                oldClrType: typeof(DateTime?),
                oldType: "timestamp without time zone",
                oldNullable: true);
        }
    }
}
