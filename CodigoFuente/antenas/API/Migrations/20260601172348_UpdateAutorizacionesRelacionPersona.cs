using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAutorizacionesRelacionPersona : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "relacion",
                schema: "public",
                table: "ef_autorizaciones");

            migrationBuilder.AddColumn<long>(
                name: "id_relacion_persona",
                schema: "public",
                table: "ef_autorizaciones",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ef_param_relaciones_persona",
                schema: "public",
                columns: table => new
                {
                    id_relacion_persona = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    permite_responsable_inscripcion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    permite_autorizado_retiro = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    permite_rsvp_grupo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_param_relaciones_persona_pkey", x => x.id_relacion_persona);
                });

            migrationBuilder.CreateTable(
                name: "ef_portal_recuperacion_tokens",
                schema: "public",
                columns: table => new
                {
                    id_portal_recuperacion_token = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_portal_persona = table.Column<long>(type: "bigint", nullable: false),
                    token_recuperacion = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    codigo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    destino = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    usado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_uso = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_portal_recuperacion_tokens", x => x.id_portal_recuperacion_token);
                    table.ForeignKey(
                        name: "fk_portal_recuperacion_persona",
                        column: x => x.id_portal_persona,
                        principalSchema: "public",
                        principalTable: "portal_persona",
                        principalColumn: "IdPortalPersona",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_portal_validaciones",
                schema: "public",
                columns: table => new
                {
                    id_portal_validacion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    token_consulta = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    codigo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    destino = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    validado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_validacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_portal_validaciones", x => x.id_portal_validacion);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ef_autorizaciones_id_relacion_persona",
                schema: "public",
                table: "ef_autorizaciones",
                column: "id_relacion_persona");

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_relaciones_persona_activo_orden",
                schema: "public",
                table: "ef_param_relaciones_persona",
                columns: new[] { "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_relaciones_persona_codigo",
                schema: "public",
                table: "ef_param_relaciones_persona",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_portal_recuperacion_tokens_id_portal_persona",
                schema: "public",
                table: "ef_portal_recuperacion_tokens",
                column: "id_portal_persona");

            migrationBuilder.CreateIndex(
                name: "ux_portal_recuperacion_token",
                schema: "public",
                table: "ef_portal_recuperacion_tokens",
                column: "token_recuperacion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_portal_validaciones_token",
                schema: "public",
                table: "ef_portal_validaciones",
                columns: new[] { "token_consulta", "validado", "fecha_expiracion" });

            migrationBuilder.AddForeignKey(
                name: "FK_ef_autorizaciones_ef_param_relaciones_persona_id_relacion_p~",
                schema: "public",
                table: "ef_autorizaciones",
                column: "id_relacion_persona",
                principalSchema: "public",
                principalTable: "ef_param_relaciones_persona",
                principalColumn: "id_relacion_persona");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ef_autorizaciones_ef_param_relaciones_persona_id_relacion_p~",
                schema: "public",
                table: "ef_autorizaciones");

            migrationBuilder.DropTable(
                name: "ef_param_relaciones_persona",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_portal_recuperacion_tokens",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_portal_validaciones",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_ef_autorizaciones_id_relacion_persona",
                schema: "public",
                table: "ef_autorizaciones");

            migrationBuilder.DropColumn(
                name: "id_relacion_persona",
                schema: "public",
                table: "ef_autorizaciones");

            migrationBuilder.AddColumn<string>(
                name: "relacion",
                schema: "public",
                table: "ef_autorizaciones",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);
        }
    }
}
