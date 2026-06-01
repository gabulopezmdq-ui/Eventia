using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class RenamePortalTablesToEf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_portal_acceso_portal_persona_IdPortalPersona",
                schema: "public",
                table: "portal_acceso");

            migrationBuilder.DropPrimaryKey(
                name: "PK_portal_verificacion",
                schema: "public",
                table: "portal_verificacion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_portal_persona",
                schema: "public",
                table: "portal_persona");

            migrationBuilder.DropPrimaryKey(
                name: "PK_portal_acceso",
                schema: "public",
                table: "portal_acceso");

            migrationBuilder.RenameTable(
                name: "portal_verificacion",
                schema: "public",
                newName: "ef_portal_verificaciones",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "portal_persona",
                schema: "public",
                newName: "ef_portal_personas",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "portal_acceso",
                schema: "public",
                newName: "ef_portal_accesos",
                newSchema: "public");

            migrationBuilder.RenameColumn(
                name: "TokenConsulta",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "token_consulta");

            migrationBuilder.RenameColumn(
                name: "ResultadoOk",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "resultado_ok");

            migrationBuilder.RenameColumn(
                name: "FechaHora",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "fecha_hora");

            migrationBuilder.RenameColumn(
                name: "EmailUsado",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "email_usado");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "id_portal_verificacion");

            migrationBuilder.RenameIndex(
                name: "IX_portal_verificacion_TokenConsulta",
                schema: "public",
                table: "ef_portal_verificaciones",
                newName: "IX_ef_portal_verificaciones_token_consulta");

            migrationBuilder.RenameColumn(
                name: "Telefono",
                schema: "public",
                table: "ef_portal_personas",
                newName: "telefono");

            migrationBuilder.RenameColumn(
                name: "Nombre",
                schema: "public",
                table: "ef_portal_personas",
                newName: "nombre");

            migrationBuilder.RenameColumn(
                name: "Email",
                schema: "public",
                table: "ef_portal_personas",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Activo",
                schema: "public",
                table: "ef_portal_personas",
                newName: "activo");

            migrationBuilder.RenameColumn(
                name: "TokenPortal",
                schema: "public",
                table: "ef_portal_personas",
                newName: "token_portal");

            migrationBuilder.RenameColumn(
                name: "FechaAlta",
                schema: "public",
                table: "ef_portal_personas",
                newName: "fecha_alta");

            migrationBuilder.RenameColumn(
                name: "IdPortalPersona",
                schema: "public",
                table: "ef_portal_personas",
                newName: "id_portal_persona");

            migrationBuilder.RenameIndex(
                name: "IX_portal_persona_Telefono",
                schema: "public",
                table: "ef_portal_personas",
                newName: "IX_ef_portal_personas_telefono");

            migrationBuilder.RenameIndex(
                name: "IX_portal_persona_Email",
                schema: "public",
                table: "ef_portal_personas",
                newName: "IX_ef_portal_personas_email");

            migrationBuilder.RenameColumn(
                name: "Tipo",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "tipo");

            migrationBuilder.RenameColumn(
                name: "Activo",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "activo");

            migrationBuilder.RenameColumn(
                name: "TokenConsulta",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "token_consulta");

            migrationBuilder.RenameColumn(
                name: "TituloOverride",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "titulo_override");

            migrationBuilder.RenameColumn(
                name: "IdPortalPersona",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "id_portal_persona");

            migrationBuilder.RenameColumn(
                name: "IdInvitado",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "id_invitado");

            migrationBuilder.RenameColumn(
                name: "IdInscripcion",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "id_inscripcion");

            migrationBuilder.RenameColumn(
                name: "IdEvento",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "id_evento");

            migrationBuilder.RenameColumn(
                name: "GrupoId",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "grupo_id");

            migrationBuilder.RenameColumn(
                name: "FechaModif",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "fecha_modif");

            migrationBuilder.RenameColumn(
                name: "FechaAlta",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "fecha_alta");

            migrationBuilder.RenameColumn(
                name: "IdPortalAcceso",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "id_portal_acceso");

            migrationBuilder.RenameIndex(
                name: "IX_portal_acceso_TokenConsulta",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "IX_ef_portal_accesos_token_consulta");

            migrationBuilder.RenameIndex(
                name: "IX_portal_acceso_IdPortalPersona",
                schema: "public",
                table: "ef_portal_accesos",
                newName: "IX_ef_portal_accesos_id_portal_persona");

            migrationBuilder.AlterColumn<string>(
                name: "tipo",
                schema: "public",
                table: "ef_portal_accesos",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ef_portal_verificaciones",
                schema: "public",
                table: "ef_portal_verificaciones",
                column: "id_portal_verificacion");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ef_portal_personas",
                schema: "public",
                table: "ef_portal_personas",
                column: "id_portal_persona");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ef_portal_accesos",
                schema: "public",
                table: "ef_portal_accesos",
                column: "id_portal_acceso");

            migrationBuilder.AddForeignKey(
                name: "FK_ef_portal_accesos_ef_portal_personas_id_portal_persona",
                schema: "public",
                table: "ef_portal_accesos",
                column: "id_portal_persona",
                principalSchema: "public",
                principalTable: "ef_portal_personas",
                principalColumn: "id_portal_persona",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ef_portal_accesos_ef_portal_personas_id_portal_persona",
                schema: "public",
                table: "ef_portal_accesos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ef_portal_verificaciones",
                schema: "public",
                table: "ef_portal_verificaciones");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ef_portal_personas",
                schema: "public",
                table: "ef_portal_personas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ef_portal_accesos",
                schema: "public",
                table: "ef_portal_accesos");

            migrationBuilder.RenameTable(
                name: "ef_portal_verificaciones",
                schema: "public",
                newName: "portal_verificacion",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "ef_portal_personas",
                schema: "public",
                newName: "portal_persona",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "ef_portal_accesos",
                schema: "public",
                newName: "portal_acceso",
                newSchema: "public");

            migrationBuilder.RenameColumn(
                name: "token_consulta",
                schema: "public",
                table: "portal_verificacion",
                newName: "TokenConsulta");

            migrationBuilder.RenameColumn(
                name: "resultado_ok",
                schema: "public",
                table: "portal_verificacion",
                newName: "ResultadoOk");

            migrationBuilder.RenameColumn(
                name: "fecha_hora",
                schema: "public",
                table: "portal_verificacion",
                newName: "FechaHora");

            migrationBuilder.RenameColumn(
                name: "email_usado",
                schema: "public",
                table: "portal_verificacion",
                newName: "EmailUsado");

            migrationBuilder.RenameColumn(
                name: "id_portal_verificacion",
                schema: "public",
                table: "portal_verificacion",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_ef_portal_verificaciones_token_consulta",
                schema: "public",
                table: "portal_verificacion",
                newName: "IX_portal_verificacion_TokenConsulta");

            migrationBuilder.RenameColumn(
                name: "telefono",
                schema: "public",
                table: "portal_persona",
                newName: "Telefono");

            migrationBuilder.RenameColumn(
                name: "nombre",
                schema: "public",
                table: "portal_persona",
                newName: "Nombre");

            migrationBuilder.RenameColumn(
                name: "email",
                schema: "public",
                table: "portal_persona",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "activo",
                schema: "public",
                table: "portal_persona",
                newName: "Activo");

            migrationBuilder.RenameColumn(
                name: "token_portal",
                schema: "public",
                table: "portal_persona",
                newName: "TokenPortal");

            migrationBuilder.RenameColumn(
                name: "fecha_alta",
                schema: "public",
                table: "portal_persona",
                newName: "FechaAlta");

            migrationBuilder.RenameColumn(
                name: "id_portal_persona",
                schema: "public",
                table: "portal_persona",
                newName: "IdPortalPersona");

            migrationBuilder.RenameIndex(
                name: "IX_ef_portal_personas_telefono",
                schema: "public",
                table: "portal_persona",
                newName: "IX_portal_persona_Telefono");

            migrationBuilder.RenameIndex(
                name: "IX_ef_portal_personas_email",
                schema: "public",
                table: "portal_persona",
                newName: "IX_portal_persona_Email");

            migrationBuilder.RenameColumn(
                name: "tipo",
                schema: "public",
                table: "portal_acceso",
                newName: "Tipo");

            migrationBuilder.RenameColumn(
                name: "activo",
                schema: "public",
                table: "portal_acceso",
                newName: "Activo");

            migrationBuilder.RenameColumn(
                name: "token_consulta",
                schema: "public",
                table: "portal_acceso",
                newName: "TokenConsulta");

            migrationBuilder.RenameColumn(
                name: "titulo_override",
                schema: "public",
                table: "portal_acceso",
                newName: "TituloOverride");

            migrationBuilder.RenameColumn(
                name: "id_portal_persona",
                schema: "public",
                table: "portal_acceso",
                newName: "IdPortalPersona");

            migrationBuilder.RenameColumn(
                name: "id_invitado",
                schema: "public",
                table: "portal_acceso",
                newName: "IdInvitado");

            migrationBuilder.RenameColumn(
                name: "id_inscripcion",
                schema: "public",
                table: "portal_acceso",
                newName: "IdInscripcion");

            migrationBuilder.RenameColumn(
                name: "id_evento",
                schema: "public",
                table: "portal_acceso",
                newName: "IdEvento");

            migrationBuilder.RenameColumn(
                name: "grupo_id",
                schema: "public",
                table: "portal_acceso",
                newName: "GrupoId");

            migrationBuilder.RenameColumn(
                name: "fecha_modif",
                schema: "public",
                table: "portal_acceso",
                newName: "FechaModif");

            migrationBuilder.RenameColumn(
                name: "fecha_alta",
                schema: "public",
                table: "portal_acceso",
                newName: "FechaAlta");

            migrationBuilder.RenameColumn(
                name: "id_portal_acceso",
                schema: "public",
                table: "portal_acceso",
                newName: "IdPortalAcceso");

            migrationBuilder.RenameIndex(
                name: "IX_ef_portal_accesos_token_consulta",
                schema: "public",
                table: "portal_acceso",
                newName: "IX_portal_acceso_TokenConsulta");

            migrationBuilder.RenameIndex(
                name: "IX_ef_portal_accesos_id_portal_persona",
                schema: "public",
                table: "portal_acceso",
                newName: "IX_portal_acceso_IdPortalPersona");

            migrationBuilder.AlterColumn<int>(
                name: "Tipo",
                schema: "public",
                table: "portal_acceso",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_portal_verificacion",
                schema: "public",
                table: "portal_verificacion",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_portal_persona",
                schema: "public",
                table: "portal_persona",
                column: "IdPortalPersona");

            migrationBuilder.AddPrimaryKey(
                name: "PK_portal_acceso",
                schema: "public",
                table: "portal_acceso",
                column: "IdPortalAcceso");

            migrationBuilder.AddForeignKey(
                name: "FK_portal_acceso_portal_persona_IdPortalPersona",
                schema: "public",
                table: "portal_acceso",
                column: "IdPortalPersona",
                principalSchema: "public",
                principalTable: "portal_persona",
                principalColumn: "IdPortalPersona",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
