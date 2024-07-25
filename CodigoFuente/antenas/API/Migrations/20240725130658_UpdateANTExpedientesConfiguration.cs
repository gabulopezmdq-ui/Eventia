using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{

    public partial class UpdateANTExpedientesConfiguration : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Si existe una clave foránea con un nombre incorrecto o antiguo, elimínala
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_ANT_Expedientes_EstadoTramites_IdEstadoTramite'
                    ) THEN
                        ALTER TABLE ""ANT_Expedientes""
                        DROP CONSTRAINT ""FK_ANT_Expedientes_EstadoTramites_IdEstadoTramite"";
                    END IF;
                END
                $$;
            ");

            // Agregar o modificar la clave foránea en `ANT_Expedientes` referenciando `ANT_EstadoTramites`
            migrationBuilder.AddForeignKey(
                name: "FK_ANT_Expedientes_EstadoTramites_IdEstadoTramite",
                table: "ANT_Expedientes",
                column: "IdEstadoTramite",
                principalTable: "ANT_EstadoTramites",
                principalColumn: "IdEstado",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar la clave foránea si es necesario
            migrationBuilder.DropForeignKey(
                name: "FK_ANT_Expedientes_EstadoTramites_IdEstadoTramite",
                table: "ANT_Expedientes");
        }
    }
}