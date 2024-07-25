using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEstadoTramiteConfiguration : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verificar si el índice ya existe antes de intentar crearlo
            migrationBuilder.Sql(@"
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE tablename='ANT_Expedientes' AND indexname='IX_ANT_Expedientes_IdEstadoTramite'
                ) THEN
                    CREATE INDEX ""IX_ANT_Expedientes_IdEstadoTramite"" 
                    ON ""ANT_Expedientes""(""IdEstadoTramite"");
                END IF;
            END
            $$;
        ");

            // Añadir la restricción de clave foránea
            migrationBuilder.AddForeignKey(
                name: "FK_ANT_Expedientes_ANT_EstadoTramite_IdEstadoTramite",
                table: "ANT_Expedientes",
                column: "IdEstadoTramite",
                principalTable: "ANT_EstadoTramites",
                principalColumn: "IdEstadoTramite",
                onDelete: ReferentialAction.Restrict); // Cambia a `Cascade` si deseas eliminar registros relacionados en cascada
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Elimina la clave foránea
            migrationBuilder.DropForeignKey(
                name: "FK_ANT_Expedientes_ANT_EstadoTramite_IdEstadoTramite",
                table: "ANT_Expedientes");

            // Elimina el índice si existe
            migrationBuilder.Sql(@"
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE tablename='ANT_Expedientes' AND indexname='IX_ANT_Expedientes_IdEstadoTramite'
                ) THEN
                    DROP INDEX ""IX_ANT_Expedientes_IdEstadoTramite"";
                END IF;
            END
            $$;
        ");
        }
    }
}