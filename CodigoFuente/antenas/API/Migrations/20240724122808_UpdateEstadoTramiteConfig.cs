using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEstadoTramiteConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Crear el índice en la columna IdEstadoTramite
            migrationBuilder.CreateIndex(
                name: "IX_ANT_Expedientes_IdEstadoTramite",
                table: "ANT_Expedientes",
                column: "IdEstadoTramite");

            // Agregar la restricción de clave externa en la tabla ANT_Expedientes
            migrationBuilder.AddForeignKey(
                name: "FK_ANT_Expedientes_ANT_EstadoTramites_IdEstadoTramite",
                table: "ANT_Expedientes",
                column: "IdEstadoTramite",
                principalTable: "ANT_EstadoTramites",
                principalColumn: "IdEstado",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar la restricción de clave externa en la tabla ANT_Expedientes
            migrationBuilder.DropForeignKey(
                name: "FK_ANT_Expedientes_ANT_EstadoTramites_IdEstadoTramite",
                table: "ANT_Expedientes");

            // Eliminar el índice en la columna IdEstadoTramite
            migrationBuilder.DropIndex(
                name: "IX_ANT_Expedientes_IdEstadoTramite",
                table: "ANT_Expedientes");
        }
    }
}