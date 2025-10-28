using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class FixMEC_TMPEFI_FK : Migration
    {
        /// <inheritdoc />
            protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_mec_tmpefi_cabecera",
                table: "MEC_TMPEFI");

            migrationBuilder.AddForeignKey(
                name: "fk_mec_tmpefi_cabecera",
                table: "MEC_TMPEFI",
                column: "IdCabecera",
                principalTable: "MEC_CabeceraLiquidacion",
                principalColumn: "IdCabecera",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_mec_tmpefi_cabecera",
                table: "MEC_TMPEFI");
        }

    }
}
