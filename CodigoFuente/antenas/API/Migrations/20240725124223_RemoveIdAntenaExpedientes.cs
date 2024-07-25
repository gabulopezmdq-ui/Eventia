using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    public partial class RemoveIdAntenaExpedientes : Migration
    {
    protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verificar si la columna existe antes de eliminarla
            migrationBuilder.Sql(@"
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='ANT_Expedientes' AND column_name='IdAntenas') THEN
                    ALTER TABLE ""ANT_Expedientes"" DROP COLUMN ""IdAntenas"";
                END IF;
            END
            $$;
        ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Agregar la columna nuevamente si se revierte la migración
            migrationBuilder.AddColumn<int>(
                name: "IdAntenas",
                table: "ANT_Expedientes",
                type: "integer",
                nullable: true);
        }

    }
}