using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class MiEventiaTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "ef_addon_features",
                schema: "public",
                columns: table => new
                {
                    id_addon_feature = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_addon = table.Column<long>(type: "bigint", nullable: false),
                    id_feature = table.Column<long>(type: "bigint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json_override = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_addon_features", x => x.id_addon_feature);
                });

            migrationBuilder.CreateTable(
                name: "ef_addons",
                schema: "public",
                columns: table => new
                {
                    id_addon = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nombre = table.Column<string>(type: "character varying(90)", maxLength: 90, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json_default = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_addons", x => x.id_addon);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_hospedaje_plantillas",
                schema: "public",
                columns: table => new
                {
                    id_hospedaje_plantilla = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    id_unidad = table.Column<long>(type: "bigint", nullable: true),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ciudad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    zona = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    id_pais = table.Column<short>(type: "smallint", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_hospedaje_plantillas", x => x.id_hospedaje_plantilla);
                });

            migrationBuilder.CreateTable(
                name: "ef_dress_code",
                schema: "public",
                columns: table => new
                {
                    id_dress_code = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_dress_code", x => x.id_dress_code);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_features",
                columns: table => new
                {
                    id_evento_feature = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_feature = table.Column<long>(type: "bigint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_features", x => x.id_evento_feature);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_links",
                columns: table => new
                {
                    id_evento_link = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    tipo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    token = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    scopes = table.Column<string>(type: "jsonb", nullable: true),
                    descripcion = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    fecha_vencimiento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_links", x => x.id_evento_link);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_musica_bloqueos",
                columns: table => new
                {
                    id_evento_musica_bloqueo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    artista = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    link = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    nota = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    hash_normalizado = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_musica_bloqueos", x => x.id_evento_musica_bloqueo);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_musica_momentos",
                columns: table => new
                {
                    id_evento_musica_momento = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_musica_momentos", x => x.id_evento_musica_momento);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_musica_playlist",
                columns: table => new
                {
                    id_evento_musica_playlist = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_evento_musica_momento = table.Column<long>(type: "bigint", nullable: true),
                    titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    artista = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    link = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_musica_playlist", x => x.id_evento_musica_playlist);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_musica_sugerencias_estado",
                columns: table => new
                {
                    id_evento_musica_sugerencia_estado = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado_musica_sugerencia = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "PENDIENTE"),
                    nota_interna = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    id_evento_musica_playlist = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_musica_sugerencias_estado", x => x.id_evento_musica_sugerencia_estado);
                });

            migrationBuilder.CreateTable(
                name: "ef_hospedaje_tags",
                schema: "public",
                columns: table => new
                {
                    id_hospedaje_tag = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_hospedaje_tags", x => x.id_hospedaje_tag);
                });

            migrationBuilder.CreateTable(
                name: "ef_idiomas",
                columns: table => new
                {
                    id_idioma = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo_idioma = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    codigo_region = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    locale = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    nombre_largo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    bandera_iso2 = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_idiomas", x => x.id_idioma);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitado_musica_sugerencias",
                columns: table => new
                {
                    id_invitado_musica_sugerencia = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    artista = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    link = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    nota = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    hash_normalizado = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitado_musica_sugerencias", x => x.id_invitado_musica_sugerencia);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitado_musica_votos",
                columns: table => new
                {
                    id_invitado_musica_voto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado_musica_sugerencia = table.Column<long>(type: "bigint", nullable: false),
                    valor = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitado_musica_votos", x => x.id_invitado_musica_voto);
                });

            migrationBuilder.CreateTable(
                name: "ef_monedas",
                columns: table => new
                {
                    codigo_moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    simbolo = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_monedas", x => x.codigo_moneda);
                });

            migrationBuilder.CreateTable(
                name: "ef_pagos",
                schema: "public",
                columns: table => new
                {
                    id_pago = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_suscripcion = table.Column<long>(type: "bigint", nullable: true),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: true),
                    id_evento = table.Column<long>(type: "bigint", nullable: true),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "CREADO"),
                    moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    importe = table.Column<decimal>(type: "numeric", nullable: false),
                    impuestos = table.Column<decimal>(type: "numeric", nullable: false, defaultValue: 0m),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    concepto = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    precio_referencia_id = table.Column<long>(type: "bigint", nullable: true),
                    snapshot_json = table.Column<string>(type: "jsonb", nullable: true),
                    idempotency_key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    external_provider = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    external_payment_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    external_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    objeto_tipo = table.Column<string>(type: "text", nullable: true),
                    id_evento_plan_cambio = table.Column<long>(type: "bigint", nullable: true),
                    id_plan = table.Column<long>(type: "bigint", nullable: true),
                    id_addon = table.Column<long>(type: "bigint", nullable: true),
                    codigo_mercado = table.Column<string>(type: "text", nullable: true),
                    codigo_moneda = table.Column<string>(type: "text", nullable: true),
                    precio_lista_snapshot = table.Column<decimal>(type: "numeric", nullable: true),
                    precio_publicado_snapshot = table.Column<decimal>(type: "numeric", nullable: true),
                    tipo_ajuste = table.Column<string>(type: "text", nullable: true),
                    importe_ajuste = table.Column<decimal>(type: "numeric", nullable: true),
                    total_a_cobrar_snapshot = table.Column<decimal>(type: "numeric", nullable: true),
                    importe_pagado = table.Column<decimal>(type: "numeric", nullable: true),
                    medio_pago = table.Column<string>(type: "text", nullable: true),
                    referencia_pago = table.Column<string>(type: "text", nullable: true),
                    observacion_admin = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_pagos", x => x.id_pago);
                });

            migrationBuilder.CreateTable(
                name: "ef_paises",
                schema: "public",
                columns: table => new
                {
                    id_pais = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo_iso2 = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    codigo_iso3 = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_paises", x => x.id_pais);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_audiencia_tags",
                schema: "public",
                columns: table => new
                {
                    id_param_audiencia_tag = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tag_tipo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    tag_valor = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    nombre_mostrar = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    origen = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "MANUAL"),
                    permite_asignacion_manual = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_param_audiencia_tags_pkey", x => x.id_param_audiencia_tag);
                    table.CheckConstraint("ck_ef_param_audiencia_tags_origen", "origen in ('MANUAL','AUTO')");
                });

            migrationBuilder.CreateTable(
                name: "ef_param_edad_rangos",
                schema: "public",
                columns: table => new
                {
                    id_edad_rango = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    nombre = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    categoria_base = table.Column<string>(type: "char(1)", nullable: false),
                    edad_min = table.Column<short>(type: "smallint", nullable: false),
                    edad_max = table.Column<short>(type: "smallint", nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_param_edad_rangos_pkey", x => x.id_edad_rango);
                    table.CheckConstraint("ck_ef_param_edad_rangos_cat", "categoria_base in ('A','N','B')");
                    table.CheckConstraint("ck_ef_param_edad_rangos_max", "edad_max IS NULL OR edad_max >= edad_min");
                    table.CheckConstraint("ck_ef_param_edad_rangos_min", "edad_min >= 0");
                });

            migrationBuilder.CreateTable(
                name: "ef_param_entidades",
                columns: table => new
                {
                    entidad = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    grupo_menu = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    orden_menu = table.Column<short>(type: "smallint", nullable: false),
                    requiere_traducciones = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_es_ar = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_todos_idiomas = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    usa_orden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fallback_locale = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    max_len_texto = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)120),
                    ayuda_ui = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    editable_por_superadmin = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_entidades", x => x.entidad);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_feature_dependencias",
                columns: table => new
                {
                    id_feature = table.Column<long>(type: "bigint", nullable: false),
                    id_feature_requiere = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_feature_dependencias", x => new { x.id_feature, x.id_feature_requiere });
                });

            migrationBuilder.CreateTable(
                name: "ef_param_features",
                columns: table => new
                {
                    id_feature = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    categoria = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    scope_default = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "EVENTO"),
                    fase_sugerida = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)2),
                    monetizable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_features", x => x.id_feature);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_intereses_evento_publico",
                schema: "public",
                columns: table => new
                {
                    id_interes_evento_publico = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_intereses_evento_publico", x => x.id_interes_evento_publico);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_limites",
                schema: "public",
                columns: table => new
                {
                    id_limite = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo_limite = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    tipo_valor = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "INT"),
                    scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "EVENTO"),
                    mostrar_publico = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_limites", x => x.id_limite);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_medios_pago",
                columns: table => new
                {
                    id_medio_pago = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false),
                    permite_referencia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    es_internacional = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_medios_pago", x => x.id_medio_pago);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_perfiles_asistencia",
                schema: "public",
                columns: table => new
                {
                    id_perfil_asistencia = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_perfiles_asistencia", x => x.id_perfil_asistencia);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_portal_secciones",
                schema: "public",
                columns: table => new
                {
                    id_portal_seccion = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    aplica_evento = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    aplica_programa = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_feature_codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    orden_default = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_portal_secciones", x => x.id_portal_seccion);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_preferencias_musicales",
                schema: "public",
                columns: table => new
                {
                    id_preferencia_musical = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_preferencias_musicales", x => x.id_preferencia_musical);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_autorizaciones_base",
                schema: "public",
                columns: table => new
                {
                    id_autorizacion_base = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(60)", unicode: false, maxLength: 60, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_autorizaciones_base", x => x.id_autorizacion_base);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_salud_tipos_accion",
                schema: "public",
                columns: table => new
                {
                    id_tipo_accion_salud = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_salud_tipos_accion", x => x.id_tipo_accion_salud);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_servicios_base",
                schema: "public",
                columns: table => new
                {
                    id_servicio_base = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_servicios_base", x => x.id_servicio_base);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_tipos_ajuste",
                schema: "public",
                columns: table => new
                {
                    id_tipo_ajuste = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_tipos_ajuste", x => x.id_tipo_ajuste);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_tipos_calculo",
                schema: "public",
                columns: table => new
                {
                    id_tipo_calculo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_tipos_calculo", x => x.id_tipo_calculo);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_tipos_campo_extra",
                schema: "public",
                columns: table => new
                {
                    id_tipo_campo_extra = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(30)", unicode: false, maxLength: 30, nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_tipos_campo_extra", x => x.id_tipo_campo_extra);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_restricciones_alimentarias",
                schema: "public",
                columns: table => new
                {
                    id_restriccion_alim = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    categoria = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "OTRA"),
                    icon_key = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "GENERIC"),
                    requiere_alerta_visual = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_confirmacion_organizador = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    es_alergeno = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_param_restricciones_alimentarias_pkey", x => x.id_restriccion_alim);
                    table.CheckConstraint("ck_ef_param_restriccion_orden", "orden >= 1");
                    table.CheckConstraint("ck_restr_categoria", "categoria IN ('ALERGIA','INTOLERANCIA','ELECCION','RELIGIOSO','OTRA')");
                });

            migrationBuilder.CreateTable(
                name: "ef_param_tipos_beneficio_registro",
                schema: "public",
                columns: table => new
                {
                    id_tipo_beneficio_registro = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_tipos_beneficio_registro", x => x.id_tipo_beneficio_registro);
                    table.CheckConstraint("ck_ef_param_tipos_beneficio_registro_orden", "orden >= 1");
                });

            migrationBuilder.CreateTable(
                name: "ef_plan_features",
                schema: "public",
                columns: table => new
                {
                    id_plan_feature = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_plan = table.Column<long>(type: "bigint", nullable: false),
                    id_feature = table.Column<long>(type: "bigint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json_override = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plan_features", x => x.id_plan_feature);
                });

            migrationBuilder.CreateTable(
                name: "ef_plan_limites",
                schema: "public",
                columns: table => new
                {
                    id_plan_limite = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_plan = table.Column<long>(type: "bigint", nullable: false),
                    codigo_limite = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    valor_int = table.Column<int>(type: "integer", nullable: true),
                    valor_numeric = table.Column<decimal>(type: "numeric", nullable: true),
                    valor_json = table.Column<string>(type: "jsonb", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plan_limites", x => x.id_plan_limite);
                });

            migrationBuilder.CreateTable(
                name: "ef_planes",
                schema: "public",
                columns: table => new
                {
                    id_plan = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    tipo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    periodo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_planes", x => x.id_plan);
                });

            migrationBuilder.CreateTable(
                name: "ef_roles",
                schema: "public",
                columns: table => new
                {
                    id_rol = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    categoria = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    aplica_tipo_operacion = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    asignable_equipo_evento = table.Column<bool>(type: "boolean", nullable: false),
                    asignable_staff_operativo = table.Column<bool>(type: "boolean", nullable: false),
                    requiere_usuario = table.Column<bool>(type: "boolean", nullable: false),
                    permite_codigo_staff = table.Column<bool>(type: "boolean", nullable: false),
                    orden_ui = table.Column<int>(type: "integer", nullable: false),
                    pantalla_inicio = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_roles", x => x.id_rol);
                });

            migrationBuilder.CreateTable(
                name: "ef_scope_addons",
                schema: "public",
                columns: table => new
                {
                    id_scope_addon = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: true),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: true),
                    id_addon = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "ACTIVO"),
                    fecha_desde = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_hasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json_override = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_scope_addons", x => x.id_scope_addon);
                });

            migrationBuilder.CreateTable(
                name: "ef_suscripciones",
                schema: "public",
                columns: table => new
                {
                    id_suscripcion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: true),
                    id_evento = table.Column<long>(type: "bigint", nullable: true),
                    id_plan = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    auto_renueva = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    periodo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    current_period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    current_period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cancel_at_period_end = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    external_provider = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    external_subscription_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    external_customer_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    config_json = table.Column<string>(type: "jsonb", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    trial_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_suscripciones", x => x.id_suscripcion);
                });

            migrationBuilder.CreateTable(
                name: "ef_tipos_evento",
                columns: table => new
                {
                    id_tipo_evento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    tipo_operacion = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "EVENTO")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_tipos_evento", x => x.id_tipo_evento);
                    table.CheckConstraint("ck_ef_tipos_evento_tipo_operacion", "tipo_operacion in ('EVENTO', 'PROGRAMA')");
                });

            migrationBuilder.CreateTable(
                name: "ef_tramo_tipos",
                columns: table => new
                {
                    id_tramo_tipo = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_tramo_tipos", x => x.id_tramo_tipo);
                });

            migrationBuilder.CreateTable(
                name: "ef_webhook_eventos",
                schema: "public",
                columns: table => new
                {
                    id_webhook = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    external_provider = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    external_event_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    tipo_evento = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    procesado = table.Column<bool>(type: "boolean", nullable: false),
                    raw_payload = table.Column<string>(type: "jsonb", nullable: true),
                    error = table.Column<string>(type: "text", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_procesado = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_webhook_eventos", x => x.id_webhook);
                });

            migrationBuilder.CreateTable(
                name: "portal_persona",
                schema: "public",
                columns: table => new
                {
                    IdPortalPersona = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TokenPortal = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    FechaAlta = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_persona", x => x.IdPortalPersona);
                });

            migrationBuilder.CreateTable(
                name: "portal_verificacion",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TokenConsulta = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmailUsado = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ResultadoOk = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_verificacion", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vw_param_faltante_row",
                columns: table => new
                {
                    entidad = table.Column<string>(type: "text", nullable: false),
                    id_item = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "text", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    locale = table.Column<string>(type: "text", nullable: false),
                    texto_actual = table.Column<string>(type: "text", nullable: true),
                    traduccion_activa = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "vw_param_faltantes_resumen_row",
                columns: table => new
                {
                    entidad = table.Column<string>(type: "text", nullable: false),
                    items_activos = table.Column<int>(type: "integer", nullable: false),
                    total_esperado = table.Column<int>(type: "integer", nullable: false),
                    faltantes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_hospedaje_plantilla_items",
                schema: "public",
                columns: table => new
                {
                    id_hospedaje_plantilla_item = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_hospedaje_plantilla = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    zona = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    direccion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    url_externa = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    telefono = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    whatsapp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    latitud = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    longitud = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    etiquetas = table.Column<string[]>(type: "text[]", nullable: false, defaultValueSql: "'{}'::text[]"),
                    nota_publica = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    recomendado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_hospedaje_plantilla_items", x => x.id_hospedaje_plantilla_item);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_hospedaje_plantilla_items_ef_cuenta_hospedaje_pla~",
                        column: x => x.id_hospedaje_plantilla,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_hospedaje_plantillas",
                        principalColumn: "id_hospedaje_plantilla",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_traducciones",
                columns: table => new
                {
                    id_param_traduccion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    entidad = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    id_item = table.Column<long>(type: "bigint", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    texto = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    orden = table.Column<short>(type: "smallint", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_traducciones", x => x.id_param_traduccion);
                    table.ForeignKey(
                        name: "fk_param_trad_idioma",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_mercados",
                columns: table => new
                {
                    codigo_mercado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    codigo_moneda_default = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_mercados", x => x.codigo_mercado);
                    table.ForeignKey(
                        name: "FK_ef_mercados_ef_monedas_codigo_moneda_default",
                        column: x => x.codigo_moneda_default,
                        principalTable: "ef_monedas",
                        principalColumn: "codigo_moneda",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_tipos_identificacion_fiscal",
                schema: "public",
                columns: table => new
                {
                    id_tipo_identificacion_fiscal = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    id_pais = table.Column<short>(type: "smallint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_tipos_identificacion_fiscal", x => x.id_tipo_identificacion_fiscal);
                    table.ForeignKey(
                        name: "FK_ef_tipos_identificacion_fiscal_ef_paises_id_pais",
                        column: x => x.id_pais,
                        principalSchema: "public",
                        principalTable: "ef_paises",
                        principalColumn: "id_pais",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_usuarios",
                schema: "public",
                columns: table => new
                {
                    id_usuario = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    apellido = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    email_verificado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    auth_provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "local"),
                    google_sub = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    avatar_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    telefono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    id_pais = table.Column<short>(type: "smallint", nullable: true),
                    id_idioma_preferido = table.Column<short>(type: "smallint", nullable: true),
                    id_idioma_default_evento = table.Column<short>(type: "smallint", nullable: true),
                    recibir_novedades = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ultimo_login = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_usuarios", x => x.id_usuario);
                    table.ForeignKey(
                        name: "FK_ef_usuarios_ef_idiomas_id_idioma_default_evento",
                        column: x => x.id_idioma_default_evento,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_usuarios_ef_idiomas_id_idioma_preferido",
                        column: x => x.id_idioma_preferido,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_usuarios_ef_paises_id_pais",
                        column: x => x.id_pais,
                        principalSchema: "public",
                        principalTable: "ef_paises",
                        principalColumn: "id_pais",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_autorizacion_base_traducciones",
                schema: "public",
                columns: table => new
                {
                    id_autorizacion_base_traduccion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_autorizacion_base = table.Column<long>(type: "bigint", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    texto = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_autorizacion_base_traducciones", x => x.id_autorizacion_base_traduccion);
                    table.ForeignKey(
                        name: "FK_ef_param_programa_autorizacion_base_traducciones_ef_idiomas~",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_param_programa_autorizacion_base_traducciones_ef_param_p~",
                        column: x => x.id_autorizacion_base,
                        principalSchema: "public",
                        principalTable: "ef_param_programa_autorizaciones_base",
                        principalColumn: "id_autorizacion_base",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_param_programa_servicio_base_traducciones",
                schema: "public",
                columns: table => new
                {
                    id_servicio_base_traduccion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_servicio_base = table.Column<long>(type: "bigint", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_param_programa_servicio_base_traducciones", x => x.id_servicio_base_traduccion);
                    table.ForeignKey(
                        name: "FK_ef_param_programa_servicio_base_traducciones_ef_idiomas_id_~",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_param_programa_servicio_base_traducciones_ef_param_progr~",
                        column: x => x.id_servicio_base,
                        principalSchema: "public",
                        principalTable: "ef_param_programa_servicios_base",
                        principalColumn: "id_servicio_base",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_plantillas_evento",
                columns: table => new
                {
                    id_plantilla = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    id_tipo_evento = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plantillas_evento", x => x.id_plantilla);
                    table.ForeignKey(
                        name: "FK_ef_plantillas_evento_ef_tipos_evento_id_tipo_evento",
                        column: x => x.id_tipo_evento,
                        principalTable: "ef_tipos_evento",
                        principalColumn: "id_tipo_evento",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "portal_acceso",
                schema: "public",
                columns: table => new
                {
                    IdPortalAcceso = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPortalPersona = table.Column<long>(type: "bigint", nullable: false),
                    TokenConsulta = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    IdEvento = table.Column<long>(type: "bigint", nullable: false),
                    IdInscripcion = table.Column<long>(type: "bigint", nullable: false),
                    IdInvitado = table.Column<long>(type: "bigint", nullable: true),
                    GrupoId = table.Column<long>(type: "bigint", nullable: true),
                    TituloOverride = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaAlta = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaModif = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_acceso", x => x.IdPortalAcceso);
                    table.ForeignKey(
                        name: "FK_portal_acceso_portal_persona_IdPortalPersona",
                        column: x => x.IdPortalPersona,
                        principalSchema: "public",
                        principalTable: "portal_persona",
                        principalColumn: "IdPortalPersona",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_hospedaje_plantilla_item_bloques",
                schema: "public",
                columns: table => new
                {
                    id_bloque = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_hospedaje_plantilla_item = table.Column<long>(type: "bigint", nullable: false),
                    nombre_reserva = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    codigo_promocional = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    fecha_limite_reserva = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    condiciones = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    url_bloque = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_hospedaje_plantilla_item_bloques", x => x.id_bloque);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_hospedaje_plantilla_item_bloques_ef_cuenta_hosped~",
                        column: x => x.id_hospedaje_plantilla_item,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_hospedaje_plantilla_items",
                        principalColumn: "id_hospedaje_plantilla_item",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_mercado_paises",
                columns: table => new
                {
                    id_mercado_pais = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    codigo_mercado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    id_pais = table.Column<short>(type: "smallint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_mercado_paises", x => x.id_mercado_pais);
                    table.ForeignKey(
                        name: "FK_ef_mercado_paises_ef_mercados_codigo_mercado",
                        column: x => x.codigo_mercado,
                        principalTable: "ef_mercados",
                        principalColumn: "codigo_mercado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_mercado_paises_ef_paises_id_pais",
                        column: x => x.id_pais,
                        principalSchema: "public",
                        principalTable: "ef_paises",
                        principalColumn: "id_pais",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_precios",
                columns: table => new
                {
                    id_precio = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    objeto_tipo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_plan = table.Column<long>(type: "bigint", nullable: true),
                    id_addon = table.Column<long>(type: "bigint", nullable: true),
                    codigo_mercado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    codigo_moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    precio_lista = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    precio_lanzamiento = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    lanzamiento_desde = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lanzamiento_hasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    impuestos_incluidos = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    vigente_desde = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    vigente_hasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    observaciones = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_precios", x => x.id_precio);
                    table.ForeignKey(
                        name: "FK_ef_precios_ef_addons_id_addon",
                        column: x => x.id_addon,
                        principalSchema: "public",
                        principalTable: "ef_addons",
                        principalColumn: "id_addon",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_precios_ef_mercados_codigo_mercado",
                        column: x => x.codigo_mercado,
                        principalTable: "ef_mercados",
                        principalColumn: "codigo_mercado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_precios_ef_monedas_codigo_moneda",
                        column: x => x.codigo_moneda,
                        principalTable: "ef_monedas",
                        principalColumn: "codigo_moneda",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_precios_ef_planes_id_plan",
                        column: x => x.id_plan,
                        principalSchema: "public",
                        principalTable: "ef_planes",
                        principalColumn: "id_plan",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuentas",
                schema: "public",
                columns: table => new
                {
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre_cuenta = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    estado = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false, defaultValue: "P"),
                    id_plan = table.Column<long>(type: "bigint", nullable: true),
                    instagram = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    web = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ciudad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    id_pais = table.Column<short>(type: "smallint", nullable: false),
                    id_tipo_identificacion_fiscal = table.Column<short>(type: "smallint", nullable: true),
                    identificacion_fiscal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    moneda_default = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuentas", x => x.id_cuenta);
                    table.ForeignKey(
                        name: "FK_ef_cuentas_ef_paises_id_pais",
                        column: x => x.id_pais,
                        principalSchema: "public",
                        principalTable: "ef_paises",
                        principalColumn: "id_pais",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuentas_ef_planes_id_plan",
                        column: x => x.id_plan,
                        principalSchema: "public",
                        principalTable: "ef_planes",
                        principalColumn: "id_plan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuentas_ef_tipos_identificacion_fiscal_id_tipo_identific~",
                        column: x => x.id_tipo_identificacion_fiscal,
                        principalSchema: "public",
                        principalTable: "ef_tipos_identificacion_fiscal",
                        principalColumn: "id_tipo_identificacion_fiscal",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_b2b_prospectos",
                schema: "public",
                columns: table => new
                {
                    id_prospecto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre_apellido = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    empresa_nombre = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    ciudad = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    pais = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "AR"),
                    email = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    whatsapp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    eventos_por_mes = table.Column<int>(type: "integer", nullable: true),
                    origen = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "LANDING_MODAL"),
                    campania_fuente = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    campania_medio = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    campania_nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    campania_contenido = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    campania_termino = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pagina_origen = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    referer = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "NUEVO"),
                    nota_interna = table.Column<string>(type: "text", nullable: true),
                    id_usuario_asignado = table.Column<long>(type: "bigint", nullable: true),
                    proximo_contacto = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_b2b_prospectos", x => x.id_prospecto);
                    table.ForeignKey(
                        name: "fk_ef_b2b_prospectos_usuario",
                        column: x => x.id_usuario_asignado,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_usuarios_roles",
                columns: table => new
                {
                    id_usuario_rol = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_usuario = table.Column<long>(type: "bigint", nullable: false),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    usuarioid_usuario = table.Column<long>(type: "bigint", nullable: true),
                    rolid_rol = table.Column<short>(type: "smallint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_usuarios_roles", x => x.id_usuario_rol);
                    table.ForeignKey(
                        name: "FK_ef_usuarios_roles_ef_roles_rolid_rol",
                        column: x => x.rolid_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol");
                    table.ForeignKey(
                        name: "FK_ef_usuarios_roles_ef_usuarios_usuarioid_usuario",
                        column: x => x.usuarioid_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "ef_plantilla_accesos",
                columns: table => new
                {
                    id_plantilla_acceso = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_plantilla = table.Column<short>(type: "smallint", nullable: false),
                    nombre_default = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    mensaje_rsvp_default = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    es_publico_default = table.Column<bool>(type: "boolean", nullable: false),
                    orden = table.Column<short>(type: "smallint", nullable: false),
                    es_default = table.Column<bool>(type: "boolean", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plantilla_accesos", x => x.id_plantilla_acceso);
                    table.ForeignKey(
                        name: "FK_ef_plantilla_accesos_ef_plantillas_evento_id_plantilla",
                        column: x => x.id_plantilla,
                        principalTable: "ef_plantillas_evento",
                        principalColumn: "id_plantilla",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_plantilla_tramos",
                columns: table => new
                {
                    id_plantilla_tramo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_plantilla = table.Column<short>(type: "smallint", nullable: false),
                    id_tramo_tipo = table.Column<short>(type: "smallint", nullable: true),
                    nombre_default = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    leyenda_default = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plantilla_tramos", x => x.id_plantilla_tramo);
                    table.ForeignKey(
                        name: "FK_ef_plantilla_tramos_ef_plantillas_evento_id_plantilla",
                        column: x => x.id_plantilla,
                        principalTable: "ef_plantillas_evento",
                        principalColumn: "id_plantilla",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_plantilla_tramos_ef_tramo_tipos_id_tramo_tipo",
                        column: x => x.id_tramo_tipo,
                        principalTable: "ef_tramo_tipos",
                        principalColumn: "id_tramo_tipo");
                });

            migrationBuilder.CreateTable(
                name: "ef_audiencias_personas",
                schema: "public",
                columns: table => new
                {
                    id_audiencia_persona = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    apellido = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    celular = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    fecha_nacimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    instagram = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    zona = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ciudad = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    acepta_comunicaciones = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    acepta_promociones = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_audiencias_personas", x => x.id_audiencia_persona);
                    table.ForeignKey(
                        name: "FK_ef_audiencias_personas_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_clientes",
                schema: "public",
                columns: table => new
                {
                    id_cliente = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    nombre_cliente = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    telefono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_clientes", x => x.id_cliente);
                    table.ForeignKey(
                        name: "FK_ef_clientes_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_unidades",
                schema: "public",
                columns: table => new
                {
                    id_unidad = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_unidades", x => x.id_unidad);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_unidades_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_usuario_invitaciones",
                schema: "public",
                columns: table => new
                {
                    id_cuenta_usuario_invitacion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    email_invitado = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    estado = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false, defaultValue: "P"),
                    fecha_expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_aceptacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    id_usuario_invita = table.Column<long>(type: "bigint", nullable: false),
                    id_usuario_acepta = table.Column<long>(type: "bigint", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_usuario_invitaciones", x => x.id_cuenta_usuario_invitacion);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuario_invitaciones_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuario_invitaciones_ef_roles_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuario_invitaciones_ef_usuarios_id_usuario_acepta",
                        column: x => x.id_usuario_acepta,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuario_invitaciones_ef_usuarios_id_usuario_invita",
                        column: x => x.id_usuario_invita,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_cuenta_usuarios",
                schema: "public",
                columns: table => new
                {
                    id_cuenta_usuario = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: false),
                    id_usuario = table.Column<long>(type: "bigint", nullable: false),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cuenta_usuarios", x => x.id_cuenta_usuario);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuarios_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuarios_ef_roles_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_cuenta_usuarios_ef_usuarios_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_b2b_prospectos_hist",
                schema: "public",
                columns: table => new
                {
                    id_hist = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_prospecto = table.Column<long>(type: "bigint", nullable: false),
                    fecha = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    id_usuario = table.Column<long>(type: "bigint", nullable: true),
                    tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    detalle = table.Column<string>(type: "text", nullable: false),
                    estado_nuevo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    proximo_contacto = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_b2b_prospectos_hist", x => x.id_hist);
                    table.ForeignKey(
                        name: "fk_hist_prospecto",
                        column: x => x.id_prospecto,
                        principalSchema: "public",
                        principalTable: "ef_b2b_prospectos",
                        principalColumn: "id_prospecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_hist_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_plantilla_acceso_tramos",
                columns: table => new
                {
                    id_plantilla_acceso = table.Column<long>(type: "bigint", nullable: false),
                    id_plantilla_tramo = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_plantilla_acceso_tramos", x => new { x.id_plantilla_acceso, x.id_plantilla_tramo });
                    table.ForeignKey(
                        name: "FK_ef_plantilla_acceso_tramos_ef_plantilla_accesos_id_plantill~",
                        column: x => x.id_plantilla_acceso,
                        principalTable: "ef_plantilla_accesos",
                        principalColumn: "id_plantilla_acceso",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_plantilla_acceso_tramos_ef_plantilla_tramos_id_plantilla~",
                        column: x => x.id_plantilla_tramo,
                        principalTable: "ef_plantilla_tramos",
                        principalColumn: "id_plantilla_tramo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_audiencia_persona_tags",
                schema: "public",
                columns: table => new
                {
                    id_audiencia_persona_tag = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_audiencia_persona = table.Column<long>(type: "bigint", nullable: false),
                    tag_tipo = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    tag_valor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_audiencia_persona_tags", x => x.id_audiencia_persona_tag);
                    table.ForeignKey(
                        name: "FK_ef_audiencia_persona_tags_ef_audiencias_personas_id_audienc~",
                        column: x => x.id_audiencia_persona,
                        principalSchema: "public",
                        principalTable: "ef_audiencias_personas",
                        principalColumn: "id_audiencia_persona",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_cliente_unidades",
                schema: "public",
                columns: table => new
                {
                    id_cliente_unidad = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cliente = table.Column<long>(type: "bigint", nullable: false),
                    id_unidad = table.Column<long>(type: "bigint", nullable: false),
                    es_principal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_cliente_unidades", x => x.id_cliente_unidad);
                    table.ForeignKey(
                        name: "FK_ef_cliente_unidades_ef_clientes_id_cliente",
                        column: x => x.id_cliente,
                        principalSchema: "public",
                        principalTable: "ef_clientes",
                        principalColumn: "id_cliente",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_cliente_unidades_ef_cuenta_unidades_id_unidad",
                        column: x => x.id_unidad,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_unidades",
                        principalColumn: "id_unidad",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_audiencia_persona_eventos",
                schema: "public",
                columns: table => new
                {
                    id_audiencia_persona_evento = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_audiencia_persona = table.Column<long>(type: "bigint", nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_unidad = table.Column<long>(type: "bigint", nullable: true),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    id_acceso = table.Column<long>(type: "bigint", nullable: true),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: true),
                    origen_registro = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    registrado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    asistio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    beneficio_otorgado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    beneficio_canjeado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_registro = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_asistencia = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_audiencia_persona_eventos", x => x.id_audiencia_persona_evento);
                    table.ForeignKey(
                        name: "FK_ef_audiencia_persona_eventos_ef_audiencias_personas_id_audi~",
                        column: x => x.id_audiencia_persona,
                        principalSchema: "public",
                        principalTable: "ef_audiencias_personas",
                        principalColumn: "id_audiencia_persona",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_audiencia_persona_eventos_ef_cuenta_unidades_id_unidad",
                        column: x => x.id_unidad,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_unidades",
                        principalColumn: "id_unidad",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_autorizaciones",
                schema: "public",
                columns: table => new
                {
                    id_autorizacion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado_objetivo = table.Column<long>(type: "bigint", nullable: false),
                    tipo = table.Column<string>(type: "character(1)", nullable: false),
                    nombre_autorizado = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    telefono_autorizado = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    relacion = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    observaciones = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_baja = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    qr_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_autorizaciones", x => x.id_autorizacion);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_acceso_links",
                schema: "public",
                columns: table => new
                {
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_acceso = table.Column<long>(type: "bigint", nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    leyenda_publica = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    max_personas_total = table.Column<int>(type: "integer", nullable: false),
                    max_adultos = table.Column<int>(type: "integer", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    id_usuario_creador = table.Column<long>(type: "bigint", nullable: true),
                    requiere_nombres_acompanantes = table.Column<bool>(type: "boolean", nullable: false),
                    es_captacion_publica = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    requiere_registro = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    cupo_beneficio = table.Column<int>(type: "integer", nullable: true),
                    id_tipo_beneficio_registro = table.Column<long>(type: "bigint", nullable: true),
                    beneficio_titulo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    beneficio_descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    beneficio_hasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    mostrar_disponibles = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    mensaje_post_registro = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    origen_default = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    permite_reutilizar_audiencia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_evento_acceso_links_pkey", x => x.id_acceso_link);
                    table.CheckConstraint("ck_eal_max_adultos", "max_adultos IS NULL OR max_adultos >= 0");
                    table.CheckConstraint("ck_eal_max_personas", "max_personas_total >= 1");
                    table.ForeignKey(
                        name: "FK_ef_evento_acceso_links_ef_param_tipos_beneficio_registro_id~",
                        column: x => x.id_tipo_beneficio_registro,
                        principalSchema: "public",
                        principalTable: "ef_param_tipos_beneficio_registro",
                        principalColumn: "id_tipo_beneficio_registro",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_eal_usuario_creador",
                        column: x => x.id_usuario_creador,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_acceso_tramos",
                columns: table => new
                {
                    id_acceso = table.Column<long>(type: "bigint", nullable: false),
                    id_tramo = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_acceso_tramos", x => new { x.id_acceso, x.id_tramo });
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_accesos",
                columns: table => new
                {
                    id_acceso = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    mensaje_rsvp = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    es_publico = table.Column<bool>(type: "boolean", nullable: false),
                    cupo = table.Column<int>(type: "integer", nullable: true),
                    precio = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    orden = table.Column<short>(type: "smallint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_accesos", x => x.id_acceso);
                });

            migrationBuilder.CreateTable(
                name: "ef_eventos",
                schema: "public",
                columns: table => new
                {
                    id_evento = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_tipo_evento = table.Column<int>(type: "integer", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    id_pais = table.Column<short>(type: "smallint", nullable: true),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: true),
                    id_unidad = table.Column<long>(type: "bigint", nullable: true),
                    id_cliente = table.Column<long>(type: "bigint", nullable: true),
                    anfitriones_texto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    id_dress_code = table.Column<short>(type: "smallint", nullable: true),
                    dress_code_descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    saludo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    mensaje_bienvenida = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_evento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    tipo_operacion = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "EVENTO"),
                    fecha_inicio = table.Column<DateOnly>(type: "date", nullable: true),
                    fecha_fin = table.Column<DateOnly>(type: "date", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    estado = table.Column<string>(type: "character varying(1)", unicode: false, maxLength: 1, nullable: false, defaultValue: "B"),
                    rsvp_public_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    id_usuario_rsvp_link_creator = table.Column<long>(type: "bigint", nullable: true),
                    modo_acceso = table.Column<string>(type: "character varying(1)", unicode: false, maxLength: 1, nullable: false),
                    modo_asistencia = table.Column<string>(type: "character varying(1)", unicode: false, maxLength: 1, nullable: false),
                    es_publico = table.Column<bool>(type: "boolean", nullable: false),
                    id_acceso_default = table.Column<long>(type: "bigint", nullable: true),
                    id_plan = table.Column<long>(type: "bigint", nullable: true),
                    info_publica = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_eventos", x => x.id_evento);
                    table.CheckConstraint("ck_ef_eventos_b2b_ids", "((id_cuenta is null and id_cliente is null and id_unidad is null) or (id_cuenta is not null))");
                    table.CheckConstraint("ck_ef_eventos_programa_fechas", "tipo_operacion <> 'PROGRAMA' or (fecha_inicio is not null and fecha_fin is not null and fecha_fin >= fecha_inicio)");
                    table.CheckConstraint("ck_ef_eventos_tipo_operacion", "tipo_operacion in ('EVENTO', 'PROGRAMA')");
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_clientes_id_cliente",
                        column: x => x.id_cliente,
                        principalSchema: "public",
                        principalTable: "ef_clientes",
                        principalColumn: "id_cliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_cuenta_unidades_id_unidad",
                        column: x => x.id_unidad,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_unidades",
                        principalColumn: "id_unidad",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_dress_code_id_dress_code",
                        column: x => x.id_dress_code,
                        principalSchema: "public",
                        principalTable: "ef_dress_code",
                        principalColumn: "id_dress_code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_evento_accesos_id_acceso_default",
                        column: x => x.id_acceso_default,
                        principalTable: "ef_evento_accesos",
                        principalColumn: "id_acceso",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_idiomas_id_idioma",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_paises_id_pais",
                        column: x => x.id_pais,
                        principalSchema: "public",
                        principalTable: "ef_paises",
                        principalColumn: "id_pais",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_planes_id_plan",
                        column: x => x.id_plan,
                        principalSchema: "public",
                        principalTable: "ef_planes",
                        principalColumn: "id_plan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_tipos_evento_id_tipo_evento",
                        column: x => x.id_tipo_evento,
                        principalTable: "ef_tipos_evento",
                        principalColumn: "id_tipo_evento",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_eventos_ef_usuarios_id_usuario_rsvp_link_creator",
                        column: x => x.id_usuario_rsvp_link_creator,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_config",
                columns: table => new
                {
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    moderacion_obligatoria = table.Column<bool>(type: "boolean", nullable: false),
                    permitir_nombre_invitado = table.Column<bool>(type: "boolean", nullable: false),
                    permitir_mensaje = table.Column<bool>(type: "boolean", nullable: false),
                    permitir_likes = table.Column<bool>(type: "boolean", nullable: false),
                    permitir_descarga = table.Column<bool>(type: "boolean", nullable: false),
                    mostrar_solo_aprobadas = table.Column<bool>(type: "boolean", nullable: false),
                    live_modo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    fotocabina_activa = table.Column<bool>(type: "boolean", nullable: false),
                    fotocabina_overlay_default_id = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_config", x => x.id_evento);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_config_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_overlays",
                columns: table => new
                {
                    id_overlay = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    descripcion = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    url_publica = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    thumbnail_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: true),
                    es_default = table.Column<bool>(type: "boolean", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_overlays", x => x.id_overlay);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_overlays_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_edad_rangos",
                schema: "public",
                columns: table => new
                {
                    id_evento_edad_rango = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_edad_rango = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    nombre = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    categoria_base = table.Column<string>(type: "char(1)", nullable: false),
                    edad_min = table.Column<short>(type: "smallint", nullable: false),
                    edad_max = table.Column<short>(type: "smallint", nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ef_param_edad_rangosid_edad_rango = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_evento_edad_rangos_pkey", x => x.id_evento_edad_rango);
                    table.CheckConstraint("ck_eer_cat", "categoria_base in ('A','N','B')");
                    table.CheckConstraint("ck_eer_max", "edad_max IS NULL OR edad_max >= edad_min");
                    table.CheckConstraint("ck_eer_min", "edad_min >= 0");
                    table.ForeignKey(
                        name: "FK_ef_evento_edad_rangos_ef_param_edad_rangos_ef_param_edad_ra~",
                        column: x => x.ef_param_edad_rangosid_edad_rango,
                        principalSchema: "public",
                        principalTable: "ef_param_edad_rangos",
                        principalColumn: "id_edad_rango");
                    table.ForeignKey(
                        name: "fk_eer_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_eer_param",
                        column: x => x.id_edad_rango,
                        principalSchema: "public",
                        principalTable: "ef_param_edad_rangos",
                        principalColumn: "id_edad_rango",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_estados_hist",
                schema: "public",
                columns: table => new
                {
                    id_evento_estado_hist = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_usuario = table.Column<long>(type: "bigint", nullable: false),
                    fecha = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    estado = table.Column<string>(type: "character varying(1)", unicode: false, maxLength: 1, nullable: false),
                    observaciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_estados_hist", x => x.id_evento_estado_hist);
                    table.ForeignKey(
                        name: "FK_ef_evento_estados_hist_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_estados_hist_ef_usuarios_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_plan_cambios",
                columns: table => new
                {
                    id_evento_plan_cambio = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_plan_actual = table.Column<long>(type: "bigint", nullable: false),
                    id_plan_solicitado = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    codigo_mercado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    codigo_moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    precio_plan_actual_reconocido = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                    precio_plan_solicitado_lista = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                    precio_plan_solicitado_publicado = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                    diferencia_base = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                    tipo_ajuste = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    importe_ajuste = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    motivo_ajuste = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    descripcion_ajuste = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    total_a_cobrar = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                    motivo_solicitud = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    observacion_admin = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    id_usuario_solicita = table.Column<long>(type: "bigint", nullable: false),
                    id_usuario_admin = table.Column<long>(type: "bigint", nullable: true),
                    fecha_solicitud = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_resolucion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_plan_cambios", x => x.id_evento_plan_cambio);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_mercados_codigo_mercado",
                        column: x => x.codigo_mercado,
                        principalTable: "ef_mercados",
                        principalColumn: "codigo_mercado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_monedas_codigo_moneda",
                        column: x => x.codigo_moneda,
                        principalTable: "ef_monedas",
                        principalColumn: "codigo_moneda",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_planes_id_plan_actual",
                        column: x => x.id_plan_actual,
                        principalSchema: "public",
                        principalTable: "ef_planes",
                        principalColumn: "id_plan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_planes_id_plan_solicitado",
                        column: x => x.id_plan_solicitado,
                        principalSchema: "public",
                        principalTable: "ef_planes",
                        principalColumn: "id_plan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_usuarios_id_usuario_admin",
                        column: x => x.id_usuario_admin,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_plan_cambios_ef_usuarios_id_usuario_solicita",
                        column: x => x.id_usuario_solicita,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_portal_config",
                schema: "public",
                columns: table => new
                {
                    id_evento_portal_config = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_portal_seccion = table.Column<short>(type: "smallint", nullable: false),
                    visible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    titulo_override = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    config_json = table.Column<string>(type: "jsonb", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_portal_config", x => x.id_evento_portal_config);
                    table.ForeignKey(
                        name: "fk_evento_portal_config_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_evento_portal_config_seccion",
                        column: x => x.id_portal_seccion,
                        principalSchema: "public",
                        principalTable: "ef_param_portal_secciones",
                        principalColumn: "id_portal_seccion",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_portal_fotos",
                schema: "public",
                columns: table => new
                {
                    id_portal_foto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    url_foto = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: false),
                    fecha_foto = table.Column<DateOnly>(type: "date", nullable: true),
                    visible_portal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    id_usuario_carga = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_portal_fotos", x => x.id_portal_foto);
                    table.ForeignKey(
                        name: "fk_evento_portal_fotos_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_evento_portal_fotos_usuario",
                        column: x => x.id_usuario_carga,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_fondos",
                columns: table => new
                {
                    id_fondo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descripcion_publica = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    moneda_base = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "ARS"),
                    modo_confirmacion = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "INVITADO_Y_ORGANIZADOR"),
                    permitir_excedente = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    mostrar_pendientes = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    mostrar_muro_mensajes = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    permitir_anonimo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_fondos", x => x.id_fondo);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_lista_items",
                columns: table => new
                {
                    id_regalo_item = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    cantidad_total = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    permitir_excedente = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    url_referencia = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    imagen_url = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    visible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_lista_items", x => x.id_regalo_item);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_lista_items_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_transferencias",
                columns: table => new
                {
                    id_evento_regalo_transferencia = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    codigo_moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    titulo = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    datos_transferencia_texto = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    instrucciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_transferencias", x => x.id_evento_regalo_transferencia);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_transferencias_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_transferencias_ef_monedas_codigo_moneda",
                        column: x => x.codigo_moneda,
                        principalTable: "ef_monedas",
                        principalColumn: "codigo_moneda",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_transferencias_config",
                columns: table => new
                {
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false, defaultValue: "Regalos"),
                    texto_intro = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_transferencias_config", x => x.id_evento);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_transferencias_config_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_tramos",
                columns: table => new
                {
                    id_tramo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_tramo_tipo = table.Column<short>(type: "smallint", nullable: true),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    leyenda_visible = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    notas_internas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_hora_inicio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_hora_fin = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lugar = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    direccion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    latitud = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    longitud = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: false),
                    cupo = table.Column<int>(type: "integer", nullable: true),
                    admite_mesas = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_tramos", x => x.id_tramo);
                    table.ForeignKey(
                        name: "FK_ef_evento_tramos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_tramos_ef_tramo_tipos_id_tramo_tipo",
                        column: x => x.id_tramo_tipo,
                        principalTable: "ef_tramo_tipos",
                        principalColumn: "id_tramo_tipo");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_transporte",
                schema: "public",
                columns: table => new
                {
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    info_publica = table.Column<string>(type: "character varying(800)", maxLength: 800, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ef_evento_transporte", x => x.id_evento);
                    table.ForeignKey(
                        name: "FK_ef_evento_transporte_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_transporte_pro_config",
                schema: "public",
                columns: table => new
                {
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    pro_habilitado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    requiere_pago = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    max_plazas_por_reserva = table.Column<int>(type: "integer", nullable: false, defaultValue: 4),
                    permitir_reservar_ida = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    permitir_reservar_vuelta = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    vencimiento_minutos_pago = table.Column<int>(type: "integer", nullable: true),
                    pago_titular_cuenta = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pago_cbu_alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pago_banco = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pago_instrucciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ef_evento_transporte_pro_config", x => x.id_evento);
                    table.ForeignKey(
                        name: "FK_ef_evento_transporte_pro_config_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_autorizaciones_config",
                schema: "public",
                columns: table => new
                {
                    id_programa_autorizacion_config = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_autorizacion_base = table.Column<long>(type: "bigint", nullable: true),
                    codigo = table.Column<string>(type: "character varying(60)", unicode: false, maxLength: 60, nullable: false),
                    titulo_override = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    texto_override = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    obligatoria = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_aceptacion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requiere_datos_responsable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_autorizaciones_config", x => x.id_programa_autorizacion_config);
                    table.ForeignKey(
                        name: "FK_ef_programa_autorizaciones_config_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_autorizaciones_config_ef_param_programa_autoriz~",
                        column: x => x.id_autorizacion_base,
                        principalSchema: "public",
                        principalTable: "ef_param_programa_autorizaciones_base",
                        principalColumn: "id_autorizacion_base",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_periodos",
                schema: "public",
                columns: table => new
                {
                    id_programa_periodo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    fecha_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_hasta = table.Column<DateOnly>(type: "date", nullable: false),
                    precio_base = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    moneda = table.Column<string>(type: "character varying(3)", unicode: false, maxLength: 3, nullable: false, defaultValue: "EUR"),
                    cupo = table.Column<int>(type: "integer", nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_periodos", x => x.id_programa_periodo);
                    table.CheckConstraint("ck_ef_programa_periodos_cupo", "cupo is null or cupo >= 0");
                    table.CheckConstraint("ck_ef_programa_periodos_fechas", "fecha_hasta >= fecha_desde");
                    table.CheckConstraint("ck_ef_programa_periodos_moneda", "moneda in ('EUR', 'ARS', 'USD')");
                    table.CheckConstraint("ck_ef_programa_periodos_precio", "precio_base >= 0");
                    table.ForeignKey(
                        name: "FK_ef_programa_periodos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_salud_config",
                schema: "public",
                columns: table => new
                {
                    id_salud_config = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    pedir_problema_medico = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    problema_medico_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pedir_alergias_no_alimentarias = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    alergias_no_alimentarias_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pedir_necesidad_especial = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    necesidad_especial_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pedir_cobertura_medica = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cobertura_medica_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pedir_contacto_emergencia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    contacto_emergencia_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    pedir_autoriza_emergencia_medica = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    autoriza_emergencia_medica_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    pedir_observaciones_familia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    observaciones_familia_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pedir_medicaciones = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    medicaciones_obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_salud_config", x => x.id_salud_config);
                    table.ForeignKey(
                        name: "FK_ef_programa_salud_config_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_servicios",
                schema: "public",
                columns: table => new
                {
                    id_programa_servicio = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    tipo_calculo = table.Column<string>(type: "character varying(30)", unicode: false, maxLength: 30, nullable: false),
                    precio = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    moneda = table.Column<string>(type: "character varying(3)", unicode: false, maxLength: 3, nullable: false, defaultValue: "EUR"),
                    obligatorio = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    permite_cantidad = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cupo = table.Column<int>(type: "integer", nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    requiere_seleccion_dias = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    config_json = table.Column<string>(type: "jsonb", nullable: true),
                    id_servicio_base = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_servicios", x => x.id_programa_servicio);
                    table.CheckConstraint("ck_ef_programa_servicios_cupo", "cupo is null or cupo >= 0");
                    table.CheckConstraint("ck_ef_programa_servicios_moneda", "moneda in ('EUR', 'ARS', 'USD')");
                    table.CheckConstraint("ck_ef_programa_servicios_precio", "precio >= 0");
                    table.CheckConstraint("ck_ef_programa_servicios_tipo_calculo", "tipo_calculo in ('POR_INSCRIPCION', 'POR_PERIODO', 'POR_DIA', 'POR_CANTIDAD')");
                    table.ForeignKey(
                        name: "FK_ef_programa_servicios_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_servicios_ef_param_programa_servicios_base_id_s~",
                        column: x => x.id_servicio_base,
                        principalSchema: "public",
                        principalTable: "ef_param_programa_servicios_base",
                        principalColumn: "id_servicio_base",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_rsvp_grupos",
                schema: "public",
                columns: table => new
                {
                    id_rsvp_grupo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_acceso = table.Column<long>(type: "bigint", nullable: false),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: true),
                    max_personas_total = table.Column<int>(type: "integer", nullable: false),
                    max_adultos = table.Column<int>(type: "integer", nullable: true),
                    cantidad_total = table.Column<int>(type: "integer", nullable: false),
                    rsvp_estado = table.Column<string>(type: "char(1)", nullable: false, defaultValue: "P"),
                    rsvp_mensaje = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    fecha_rsvp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    nombre_grupo = table.Column<string>(type: "text", nullable: false),
                    cant_adultos_sin_nombre = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    cant_menores_sin_nombre = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_rsvp_grupos_pkey", x => x.id_rsvp_grupo);
                    table.CheckConstraint("ck_rg_cantidad_total", "cantidad_total >= 1 AND cantidad_total <= max_personas_total");
                    table.CheckConstraint("ck_rg_max_personas", "max_personas_total >= 1");
                    table.CheckConstraint("ck_rg_rsvp_estado", "rsvp_estado in ('P','Y','N')");
                    table.ForeignKey(
                        name: "fk_rg_acceso",
                        column: x => x.id_acceso,
                        principalTable: "ef_evento_accesos",
                        principalColumn: "id_acceso",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_rg_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_rsvp_grupo_acceso_link",
                        column: x => x.id_acceso_link,
                        principalSchema: "public",
                        principalTable: "ef_evento_acceso_links",
                        principalColumn: "id_acceso_link",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_solicitudes_plantilla",
                columns: table => new
                {
                    id_solicitud = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_tipo_evento = table.Column<int>(type: "integer", nullable: false),
                    id_plantilla_referida = table.Column<short>(type: "smallint", nullable: true),
                    motivo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    detalle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    estado = table.Column<string>(type: "character(1)", nullable: false),
                    id_usuario_solicita = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_revision = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    id_usuario_revisa = table.Column<long>(type: "bigint", nullable: true),
                    observaciones_admin = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_solicitudes_plantilla", x => x.id_solicitud);
                    table.ForeignKey(
                        name: "FK_ef_solicitudes_plantilla_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_staff",
                columns: table => new
                {
                    id_staff = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cuenta = table.Column<long>(type: "bigint", nullable: true),
                    id_evento = table.Column<long>(type: "bigint", nullable: true),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    telefono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    fecha_expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_uso = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    usos = table.Column<int>(type: "integer", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_staff", x => x.id_staff);
                    table.ForeignKey(
                        name: "FK_ef_staff_ef_cuentas_id_cuenta",
                        column: x => x.id_cuenta,
                        principalSchema: "public",
                        principalTable: "ef_cuentas",
                        principalColumn: "id_cuenta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_staff_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_staff_ef_roles_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_fondo_metas",
                columns: table => new
                {
                    id_meta = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_fondo = table.Column<long>(type: "bigint", nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    tipo_meta = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "GENERICA"),
                    titulo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    objetivo_monto = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    url_referencia = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    imagen_url = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    visible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_fondo_metas", x => x.id_meta);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_metas_ef_evento_regalos_fondos_id_f~",
                        column: x => x.id_fondo,
                        principalTable: "ef_evento_regalos_fondos",
                        principalColumn: "id_fondo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_metas_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_hospedajes",
                schema: "public",
                columns: table => new
                {
                    id_hospedaje = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    zona = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    direccion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    url_externa = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    telefono = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    whatsapp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    latitud = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    longitud = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    id_tramo_referencia = table.Column<long>(type: "bigint", nullable: true),
                    precio_desde = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    precio_hasta = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    etiquetas = table.Column<string[]>(type: "text[]", nullable: false),
                    nota_publica = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    recomendado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    orden = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_hospedajes", x => x.id_hospedaje);
                    table.ForeignKey(
                        name: "FK_ef_evento_hospedajes_ef_evento_tramos_id_tramo_referencia",
                        column: x => x.id_tramo_referencia,
                        principalTable: "ef_evento_tramos",
                        principalColumn: "id_tramo",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_evento_hospedajes_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_mesas",
                columns: table => new
                {
                    id_mesa = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_tramo = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    capacidad = table.Column<int>(type: "integer", nullable: true),
                    notas = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_mesas", x => x.id_mesa);
                    table.ForeignKey(
                        name: "FK_ef_evento_mesas_ef_evento_tramos_id_tramo",
                        column: x => x.id_tramo,
                        principalTable: "ef_evento_tramos",
                        principalColumn: "id_tramo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_autorizacion_config_traducciones",
                schema: "public",
                columns: table => new
                {
                    id_programa_autorizacion_config_traduccion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_programa_autorizacion_config = table.Column<long>(type: "bigint", nullable: false),
                    id_idioma = table.Column<short>(type: "smallint", nullable: false),
                    titulo = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    texto = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_autorizacion_config_traducciones", x => x.id_programa_autorizacion_config_traduccion);
                    table.ForeignKey(
                        name: "FK_ef_programa_autorizacion_config_traducciones_ef_idiomas_id_~",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_autorizacion_config_traducciones_ef_programa_au~",
                        column: x => x.id_programa_autorizacion_config,
                        principalSchema: "public",
                        principalTable: "ef_programa_autorizaciones_config",
                        principalColumn: "id_programa_autorizacion_config",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitados",
                schema: "public",
                columns: table => new
                {
                    id_invitado = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    apellido = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    sobrenombre = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    celular = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    rsvp_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    rsvp_estado = table.Column<string>(type: "char(1)", nullable: false, defaultValue: "P"),
                    rsvp_mensaje = table.Column<string>(type: "text", nullable: true),
                    fecha_rsvp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    id_usuario_invitador = table.Column<long>(type: "bigint", nullable: true),
                    qr_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    id_acceso = table.Column<long>(type: "bigint", nullable: true),
                    id_rsvp_grupo = table.Column<long>(type: "bigint", nullable: true),
                    es_titular_grupo = table.Column<bool>(type: "boolean", nullable: false),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: true),
                    id_audiencia_persona = table.Column<long>(type: "bigint", nullable: true),
                    es_staff = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    id_rol_staff = table.Column<short>(type: "smallint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitados", x => x.id_invitado);
                    table.ForeignKey(
                        name: "FK_ef_invitados_ef_evento_acceso_links_id_acceso_link",
                        column: x => x.id_acceso_link,
                        principalSchema: "public",
                        principalTable: "ef_evento_acceso_links",
                        principalColumn: "id_acceso_link",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_invitados_ef_evento_accesos_id_acceso",
                        column: x => x.id_acceso,
                        principalTable: "ef_evento_accesos",
                        principalColumn: "id_acceso",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_invitados_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_invitados_ef_rsvp_grupos_id_rsvp_grupo",
                        column: x => x.id_rsvp_grupo,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupos",
                        principalColumn: "id_rsvp_grupo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_invitados_ef_usuarios_id_usuario_invitador",
                        column: x => x.id_usuario_invitador,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_staff",
                schema: "public",
                columns: table => new
                {
                    id_evento_staff = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_staff = table.Column<long>(type: "bigint", nullable: false),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_staff", x => x.id_evento_staff);
                    table.ForeignKey(
                        name: "FK_ef_evento_staff_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_staff_ef_roles_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_staff_ef_staff_id_staff",
                        column: x => x.id_staff,
                        principalTable: "ef_staff",
                        principalColumn: "id_staff",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_usuarios",
                schema: "public",
                columns: table => new
                {
                    id_evento_usuario = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_usuario = table.Column<long>(type: "bigint", nullable: true),
                    id_staff = table.Column<long>(type: "bigint", nullable: true),
                    id_rol = table.Column<short>(type: "smallint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_usuarios", x => x.id_evento_usuario);
                    table.ForeignKey(
                        name: "FK_ef_evento_usuarios_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_usuarios_ef_roles_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "public",
                        principalTable: "ef_roles",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_usuarios_ef_staff_id_staff",
                        column: x => x.id_staff,
                        principalTable: "ef_staff",
                        principalColumn: "id_staff");
                    table.ForeignKey(
                        name: "FK_ef_evento_usuarios_ef_usuarios_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "ef_staff_unidades",
                columns: table => new
                {
                    id_staff = table.Column<long>(type: "bigint", nullable: false),
                    id_unidad = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_staff_unidades", x => new { x.id_staff, x.id_unidad });
                    table.ForeignKey(
                        name: "FK_ef_staff_unidades_ef_cuenta_unidades_id_unidad",
                        column: x => x.id_unidad,
                        principalSchema: "public",
                        principalTable: "ef_cuenta_unidades",
                        principalColumn: "id_unidad",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_staff_unidades_ef_staff_id_staff",
                        column: x => x.id_staff,
                        principalTable: "ef_staff",
                        principalColumn: "id_staff",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_hospedaje_bloques",
                schema: "public",
                columns: table => new
                {
                    id_bloque = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_hospedaje = table.Column<long>(type: "bigint", nullable: false),
                    nombre_reserva = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    codigo_promocional = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    fecha_limite_reserva = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    condiciones = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    url_bloque = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_hospedaje_bloques", x => x.id_bloque);
                    table.ForeignKey(
                        name: "FK_ef_evento_hospedaje_bloques_ef_evento_hospedajes_id_hospeda~",
                        column: x => x.id_hospedaje,
                        principalSchema: "public",
                        principalTable: "ef_evento_hospedajes",
                        principalColumn: "id_hospedaje",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_fotos",
                columns: table => new
                {
                    id_foto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_tramo = table.Column<long>(type: "bigint", nullable: true),
                    id_overlay = table.Column<long>(type: "bigint", nullable: true),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    device_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    storage_provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    storage_bucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    url_publica = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    thumbnail_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    nombre_original = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tamano_bytes = table.Column<long>(type: "bigint", nullable: true),
                    ancho = table.Column<int>(type: "integer", nullable: true),
                    alto = table.Column<int>(type: "integer", nullable: true),
                    nombre_invitado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    mensaje = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    origen = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    es_destacada = table.Column<bool>(type: "boolean", nullable: false),
                    likes_count = table.Column<int>(type: "integer", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_fotos", x => x.id_foto);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotos_ef_evento_tramos_id_tramo",
                        column: x => x.id_tramo,
                        principalTable: "ef_evento_tramos",
                        principalColumn: "id_tramo");
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotos_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_beneficios_registro",
                schema: "public",
                columns: table => new
                {
                    id_beneficio_registro = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: false),
                    id_tipo_beneficio_registro = table.Column<long>(type: "bigint", nullable: false),
                    titulo_snapshot = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion_snapshot = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    estado = table.Column<string>(type: "character varying(1)", unicode: false, maxLength: 1, nullable: false, defaultValue: "G"),
                    codigo_canje = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    fecha_otorgado = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_canje = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_vencimiento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    id_usuario_valida = table.Column<long>(type: "bigint", nullable: true),
                    observaciones = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_beneficios_registro", x => x.id_beneficio_registro);
                    table.CheckConstraint("ck_ef_evento_beneficios_registro_estado", "estado = any (array['G'::bpchar, 'C'::bpchar, 'V'::bpchar, 'A'::bpchar])");
                    table.ForeignKey(
                        name: "FK_ef_evento_beneficios_registro_ef_evento_acceso_links_id_acc~",
                        column: x => x.id_acceso_link,
                        principalSchema: "public",
                        principalTable: "ef_evento_acceso_links",
                        principalColumn: "id_acceso_link",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_beneficios_registro_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_beneficios_registro_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_beneficios_registro_ef_param_tipos_beneficio_regi~",
                        column: x => x.id_tipo_beneficio_registro,
                        principalSchema: "public",
                        principalTable: "ef_param_tipos_beneficio_registro",
                        principalColumn: "id_tipo_beneficio_registro",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_beneficios_registro_ef_usuarios_id_usuario_valida",
                        column: x => x.id_usuario_valida,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_checkins",
                schema: "public",
                columns: table => new
                {
                    id_checkin = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    id_acceso = table.Column<long>(type: "bigint", nullable: true),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: true),
                    tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    fecha = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    id_usuario_operador = table.Column<long>(type: "bigint", nullable: true),
                    observaciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_checkins", x => x.id_checkin);
                    table.ForeignKey(
                        name: "FK_ef_evento_checkins_ef_evento_acceso_links_id_acceso_link",
                        column: x => x.id_acceso_link,
                        principalSchema: "public",
                        principalTable: "ef_evento_acceso_links",
                        principalColumn: "id_acceso_link",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_checkins_ef_evento_accesos_id_acceso",
                        column: x => x.id_acceso,
                        principalTable: "ef_evento_accesos",
                        principalColumn: "id_acceso",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_checkins_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_checkins_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_evento_checkins_ef_usuarios_id_usuario_operador",
                        column: x => x.id_usuario_operador,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_mesa_invitados",
                columns: table => new
                {
                    id_mesa = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_mesa_invitados", x => new { x.id_mesa, x.id_invitado });
                    table.ForeignKey(
                        name: "FK_ef_evento_mesa_invitados_ef_evento_mesas_id_mesa",
                        column: x => x.id_mesa,
                        principalTable: "ef_evento_mesas",
                        principalColumn: "id_mesa",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_mesa_invitados_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_fondo_aportes",
                columns: table => new
                {
                    id_aporte = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_fondo = table.Column<long>(type: "bigint", nullable: false),
                    id_meta = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    rsvp_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    nombre_mostrado = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    es_anonimo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    monto_aporte = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    moneda_aporte = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    monto_base_calculado = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    tipo_cambio_usado = table.Column<decimal>(type: "numeric(18,6)", nullable: true),
                    estado = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false, defaultValue: "DECLARADO"),
                    mensaje = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    mostrar_en_muro = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    comprobante_url = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    fecha_declara = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_confirma = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    id_usuario_confirma = table.Column<long>(type: "bigint", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_fondo_aportes", x => x.id_aporte);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_aportes_ef_evento_regalos_fondo_met~",
                        column: x => x.id_meta,
                        principalTable: "ef_evento_regalos_fondo_metas",
                        principalColumn: "id_meta",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_aportes_ef_evento_regalos_fondos_id~",
                        column: x => x.id_fondo,
                        principalTable: "ef_evento_regalos_fondos",
                        principalColumn: "id_fondo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_aportes_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_aportes_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_fondo_aportes_ef_usuarios_id_usuario_conf~",
                        column: x => x.id_usuario_confirma,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_regalos_lista_reservas",
                columns: table => new
                {
                    id_reserva = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_regalo_item = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    rsvp_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    nombre_mostrado = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    es_anonimo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "RESERVA_ACTIVA"),
                    mensaje = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    fecha_reserva = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    fecha_vencimiento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_cancelacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_regalos_lista_reservas", x => x.id_reserva);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_lista_reservas_ef_evento_regalos_lista_it~",
                        column: x => x.id_regalo_item,
                        principalTable: "ef_evento_regalos_lista_items",
                        principalColumn: "id_regalo_item",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_lista_reservas_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_regalos_lista_reservas_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitado_intereses_evento",
                schema: "public",
                columns: table => new
                {
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    id_interes_evento_publico = table.Column<long>(type: "bigint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitado_intereses_evento", x => new { x.id_invitado, x.id_interes_evento_publico });
                    table.ForeignKey(
                        name: "FK_ef_invitado_intereses_evento_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_invitado_intereses_evento_ef_param_intereses_evento_publ~",
                        column: x => x.id_interes_evento_publico,
                        principalSchema: "public",
                        principalTable: "ef_param_intereses_evento_publico",
                        principalColumn: "id_interes_evento_publico",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitado_perfiles",
                schema: "public",
                columns: table => new
                {
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    fecha_nacimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    edad_anios = table.Column<short>(type: "smallint", nullable: true),
                    instagram = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    zona = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ciudad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    id_perfil_asistencia = table.Column<long>(type: "bigint", nullable: true),
                    acepta_terminos = table.Column<bool>(type: "boolean", nullable: false),
                    acepta_comunicaciones = table.Column<bool>(type: "boolean", nullable: false),
                    acepta_promociones = table.Column<bool>(type: "boolean", nullable: false),
                    campania_fuente = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    campania_medio = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    campania_nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    campania_contenido = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    campania_termino = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pagina_origen = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    referer = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitado_perfiles", x => x.id_invitado);
                    table.ForeignKey(
                        name: "FK_ef_invitado_perfiles_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_invitado_perfiles_ef_param_perfiles_asistencia_id_perfil~",
                        column: x => x.id_perfil_asistencia,
                        principalSchema: "public",
                        principalTable: "ef_param_perfiles_asistencia",
                        principalColumn: "id_perfil_asistencia",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_invitado_preferencias_musicales",
                schema: "public",
                columns: table => new
                {
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    id_preferencia_musical = table.Column<long>(type: "bigint", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_invitado_preferencias_musicales", x => new { x.id_invitado, x.id_preferencia_musical });
                    table.ForeignKey(
                        name: "FK_ef_invitado_preferencias_musicales_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_invitado_preferencias_musicales_ef_param_preferencias_mu~",
                        column: x => x.id_preferencia_musical,
                        principalSchema: "public",
                        principalTable: "ef_param_preferencias_musicales",
                        principalColumn: "id_preferencia_musical",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripciones",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_acceso = table.Column<long>(type: "bigint", nullable: true),
                    id_acceso_link = table.Column<long>(type: "bigint", nullable: true),
                    id_rsvp_grupo = table.Column<long>(type: "bigint", nullable: true),
                    id_invitado_responsable = table.Column<long>(type: "bigint", nullable: true),
                    id_audiencia_persona_responsable = table.Column<long>(type: "bigint", nullable: true),
                    responsable_nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    responsable_apellido = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    responsable_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    responsable_telefono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    responsable_documento = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    responsable_relacion = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    firma_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    firma_fecha = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "BORRADOR"),
                    id_idioma = table.Column<short>(type: "smallint", nullable: true),
                    moneda = table.Column<string>(type: "character varying(3)", unicode: false, maxLength: 3, nullable: false, defaultValue: "EUR"),
                    total_base = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    total_servicios = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    total_general = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    token_consulta = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_confirmacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripciones", x => x.id_inscripcion);
                    table.CheckConstraint("ck_prog_insc_estado", "estado in ('BORRADOR', 'CONFIRMADA', 'CANCELADA', 'LISTA_ESPERA')");
                    table.CheckConstraint("ck_prog_insc_moneda", "moneda in ('EUR', 'ARS', 'USD')");
                    table.CheckConstraint("ck_prog_insc_totales", "total_base >= 0 and total_servicios >= 0 and total_general >= 0");
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_audiencias_personas_id_audienc~",
                        column: x => x.id_audiencia_persona_responsable,
                        principalSchema: "public",
                        principalTable: "ef_audiencias_personas",
                        principalColumn: "id_audiencia_persona",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_evento_acceso_links_id_acceso_~",
                        column: x => x.id_acceso_link,
                        principalSchema: "public",
                        principalTable: "ef_evento_acceso_links",
                        principalColumn: "id_acceso_link",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_evento_accesos_id_acceso",
                        column: x => x.id_acceso,
                        principalTable: "ef_evento_accesos",
                        principalColumn: "id_acceso",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_idiomas_id_idioma",
                        column: x => x.id_idioma,
                        principalTable: "ef_idiomas",
                        principalColumn: "id_idioma",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_invitados_id_invitado_responsa~",
                        column: x => x.id_invitado_responsable,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripciones_ef_rsvp_grupos_id_rsvp_grupo",
                        column: x => x.id_rsvp_grupo,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupos",
                        principalColumn: "id_rsvp_grupo",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_salud_acciones",
                schema: "public",
                columns: table => new
                {
                    id_accion_salud = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_participante = table.Column<long>(type: "bigint", nullable: false),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    fecha_hora = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    tipo_accion = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false),
                    requirio_contacto_familia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    contacto_realizado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    requiere_seguimiento = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    usuario_registro = table.Column<long>(type: "bigint", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_salud_acciones", x => x.id_accion_salud);
                    table.ForeignKey(
                        name: "FK_ef_programa_salud_acciones_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_salud_acciones_ef_invitados_id_participante",
                        column: x => x.id_participante,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_salud_acciones_ef_usuarios_usuario_registro",
                        column: x => x.usuario_registro,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ef_qr_scans",
                schema: "public",
                columns: table => new
                {
                    id_qr_scan = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: true),
                    qr_token = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    resultado = table.Column<string>(type: "char(1)", nullable: false),
                    mensaje = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    fecha_scan = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    id_usuario_operador = table.Column<long>(type: "bigint", nullable: true),
                    device_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    ip = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_qr_scans_pkey", x => x.id_qr_scan);
                    table.CheckConstraint("ck_qr_scans_resultado", "resultado in ('O','N','E')");
                    table.ForeignKey(
                        name: "fk_qr_scans_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento");
                    table.ForeignKey(
                        name: "fk_qr_scans_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado");
                    table.ForeignKey(
                        name: "fk_qr_scans_usuario",
                        column: x => x.id_usuario_operador,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "ef_retiros",
                schema: "public",
                columns: table => new
                {
                    id_retiro = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado_nino = table.Column<long>(type: "bigint", nullable: false),
                    id_autorizacion = table.Column<long>(type: "bigint", nullable: true),
                    nombre_retirador = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    celular_retirador = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    metodo_validacion = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    observaciones = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    fecha_retiro = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_operativa = table.Column<DateOnly>(type: "date", nullable: false),
                    id_usuario_operador = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_retiros", x => x.id_retiro);
                    table.ForeignKey(
                        name: "FK_ef_retiros_ef_autorizaciones_id_autorizacion",
                        column: x => x.id_autorizacion,
                        principalSchema: "public",
                        principalTable: "ef_autorizaciones",
                        principalColumn: "id_autorizacion",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_retiros_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_retiros_ef_invitados_id_invitado_nino",
                        column: x => x.id_invitado_nino,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_retiros_ef_usuarios_id_usuario_operador",
                        column: x => x.id_usuario_operador,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ef_rsvp_grupo_integrantes",
                schema: "public",
                columns: table => new
                {
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_rsvp_grupo = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: false),
                    rol = table.Column<string>(type: "char(1)", nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    id_evento_edad_rango = table.Column<long>(type: "bigint", nullable: true),
                    edad_anios = table.Column<short>(type: "smallint", nullable: true),
                    requiere_asistencia = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    alimentacion_detalle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    rol_evento = table.Column<string>(type: "char(1)", nullable: false, defaultValue: "A"),
                    modalidad_retiro = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    asiste = table.Column<string>(type: "text", nullable: false),
                    fecha_respuesta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_rsvp_grupo_integrantes_pkey", x => x.id_rsvp_grupo_integrante);
                    table.CheckConstraint("ck_rgi_edad_anios", "edad_anios IS NULL OR (edad_anios >= 0 AND edad_anios <= 120)");
                    table.CheckConstraint("ck_rgi_orden", "orden >= 1");
                    table.CheckConstraint("ck_rgi_rol", "rol in ('T','A')");
                    table.CheckConstraint("ck_rsvp_grupo_integrantes_modalidad_retiro", "modalidad_retiro IS NULL OR modalidad_retiro IN ('SE_RETIRA_SOLO','REQUIERE_AUTORIZADO','NO_APLICA')");
                    table.ForeignKey(
                        name: "fk_rgi_evento_edad",
                        column: x => x.id_evento_edad_rango,
                        principalSchema: "public",
                        principalTable: "ef_evento_edad_rangos",
                        principalColumn: "id_evento_edad_rango");
                    table.ForeignKey(
                        name: "fk_rgi_grupo",
                        column: x => x.id_rsvp_grupo,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupos",
                        principalColumn: "id_rsvp_grupo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_rgi_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_estados_hist",
                columns: table => new
                {
                    id_hist = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_foto = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    id_usuario = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_estados_hist", x => x.id_hist);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_estados_hist_ef_evento_album_fotos_id_foto",
                        column: x => x.id_foto,
                        principalTable: "ef_evento_album_fotos",
                        principalColumn: "id_foto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_estados_hist_ef_usuarios_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "public",
                        principalTable: "ef_usuarios",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_fotocabina_usos",
                columns: table => new
                {
                    id_uso = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_overlay = table.Column<long>(type: "bigint", nullable: false),
                    id_foto = table.Column<long>(type: "bigint", nullable: true),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    device_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_fotocabina_usos", x => x.id_uso);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotocabina_usos_ef_evento_album_fotos_id_fo~",
                        column: x => x.id_foto,
                        principalTable: "ef_evento_album_fotos",
                        principalColumn: "id_foto");
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotocabina_usos_ef_evento_album_overlays_id~",
                        column: x => x.id_overlay,
                        principalTable: "ef_evento_album_overlays",
                        principalColumn: "id_overlay",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotocabina_usos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_fotocabina_usos_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_likes",
                columns: table => new
                {
                    id_foto = table.Column<long>(type: "bigint", nullable: false),
                    device_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_likes", x => new { x.id_foto, x.device_id });
                    table.ForeignKey(
                        name: "FK_ef_evento_album_likes_ef_evento_album_fotos_id_foto",
                        column: x => x.id_foto,
                        principalTable: "ef_evento_album_fotos",
                        principalColumn: "id_foto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_likes_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_likes_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado");
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_rankings",
                columns: table => new
                {
                    id_ranking = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    modo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    alcance = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    id_tramo = table.Column<long>(type: "bigint", nullable: true),
                    solo_origen = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    solo_destacadas = table.Column<bool>(type: "boolean", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    visible_publico = table.Column<bool>(type: "boolean", nullable: false),
                    mostrar_resultados = table.Column<bool>(type: "boolean", nullable: false),
                    mostrar_votos = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_inicio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    fecha_fin = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cerrado = table.Column<bool>(type: "boolean", nullable: false),
                    cantidad_ganadoras = table.Column<short>(type: "smallint", nullable: false),
                    id_foto_ganadora = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_rankings", x => x.id_ranking);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_rankings_ef_evento_album_fotos_id_foto_gana~",
                        column: x => x.id_foto_ganadora,
                        principalTable: "ef_evento_album_fotos",
                        principalColumn: "id_foto");
                    table.ForeignKey(
                        name: "FK_ef_evento_album_rankings_ef_evento_tramos_id_tramo",
                        column: x => x.id_tramo,
                        principalTable: "ef_evento_tramos",
                        principalColumn: "id_tramo");
                    table.ForeignKey(
                        name: "FK_ef_evento_album_rankings_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_ajustes",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_ajuste = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    id_tipo_ajuste = table.Column<short>(type: "smallint", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    importe = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_ajustes", x => x.id_inscripcion_ajuste);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_ajustes_ef_param_programa_tipos_aju~",
                        column: x => x.id_tipo_ajuste,
                        principalSchema: "public",
                        principalTable: "ef_param_programa_tipos_ajuste",
                        principalColumn: "id_tipo_ajuste",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_ajustes_ef_programa_inscripciones_i~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_pagos",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_pago = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    fecha_pago = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    importe = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    medio_pago = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    referencia = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    observaciones = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    anulado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fecha_anulacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    motivo_anulacion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_pagos", x => x.id_inscripcion_pago);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_pagos_ef_programa_inscripciones_id_~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_autorizaciones",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_autorizacion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: true),
                    id_programa_autorizacion_config = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    texto_aceptado = table.Column<string>(type: "text", nullable: false),
                    aceptada = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_aceptacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    nombre_firmante = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ip_aceptacion = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_autorizaciones", x => x.id_inscripcion_autorizacion);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_autorizaciones_ef_programa_autoriza~",
                        column: x => x.id_programa_autorizacion_config,
                        principalSchema: "public",
                        principalTable: "ef_programa_autorizaciones_config",
                        principalColumn: "id_programa_autorizacion_config",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_autorizaciones_ef_programa_inscripc~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_autorizaciones_ef_rsvp_grupo_integr~",
                        column: x => x.id_rsvp_grupo_integrante,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupo_integrantes",
                        principalColumn: "id_rsvp_grupo_integrante",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_periodos",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_periodo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: false),
                    id_programa_periodo = table.Column<long>(type: "bigint", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    fecha_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_hasta = table.Column<DateOnly>(type: "date", nullable: false),
                    precio_base = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    moneda = table.Column<string>(type: "character varying(3)", unicode: false, maxLength: 3, nullable: false, defaultValue: "EUR"),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_periodos", x => x.id_inscripcion_periodo);
                    table.CheckConstraint("ck_prog_insc_per_fechas", "fecha_hasta >= fecha_desde");
                    table.CheckConstraint("ck_prog_insc_per_moneda", "moneda in ('EUR', 'ARS', 'USD')");
                    table.CheckConstraint("ck_prog_insc_per_precio", "precio_base >= 0");
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_periodos_ef_programa_inscripciones_~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_periodos_ef_programa_periodos_id_pr~",
                        column: x => x.id_programa_periodo,
                        principalSchema: "public",
                        principalTable: "ef_programa_periodos",
                        principalColumn: "id_programa_periodo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_periodos_ef_rsvp_grupo_integrantes_~",
                        column: x => x.id_rsvp_grupo_integrante,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupo_integrantes",
                        principalColumn: "id_rsvp_grupo_integrante",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_salud_fichas",
                schema: "public",
                columns: table => new
                {
                    id_salud_ficha = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: false),
                    tiene_problema_medico = table.Column<bool>(type: "boolean", nullable: true),
                    problema_medico_detalle = table.Column<string>(type: "text", nullable: true),
                    tiene_alergias_no_alimentarias = table.Column<bool>(type: "boolean", nullable: true),
                    alergias_no_alimentarias_detalle = table.Column<string>(type: "text", nullable: true),
                    necesidad_especial = table.Column<string>(type: "text", nullable: true),
                    cobertura_medica = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    observaciones_familia = table.Column<string>(type: "text", nullable: true),
                    autoriza_emergencia_medica = table.Column<bool>(type: "boolean", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_salud_fichas", x => x.id_salud_ficha);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_salud_fichas_ef_programa_inscripcio~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_salud_fichas_ef_rsvp_grupo_integran~",
                        column: x => x.id_rsvp_grupo_integrante,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupo_integrantes",
                        principalColumn: "id_rsvp_grupo_integrante",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_servicios",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_servicio = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion = table.Column<long>(type: "bigint", nullable: false),
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: false),
                    id_programa_servicio = table.Column<long>(type: "bigint", nullable: false),
                    id_programa_periodo = table.Column<long>(type: "bigint", nullable: true),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    tipo_calculo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    precio = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    moneda = table.Column<string>(type: "character varying(3)", unicode: false, maxLength: 3, nullable: false, defaultValue: "EUR"),
                    cantidad = table.Column<int>(type: "integer", nullable: true),
                    campos_extra_json = table.Column<string>(type: "jsonb", nullable: true),
                    subtotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_servicios", x => x.id_inscripcion_servicio);
                    table.CheckConstraint("ck_prog_insc_serv_cantidad", "cantidad is null or cantidad >= 0");
                    table.CheckConstraint("ck_prog_insc_serv_moneda", "moneda in ('EUR', 'ARS', 'USD')");
                    table.CheckConstraint("ck_prog_insc_serv_precio", "precio >= 0 and subtotal >= 0");
                    table.CheckConstraint("ck_prog_insc_serv_tipo", "tipo_calculo in ('POR_DIA', 'POR_PERIODO', 'POR_INSCRIPCION', 'POR_CANTIDAD')");
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_servicios_ef_programa_inscripciones~",
                        column: x => x.id_inscripcion,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripciones",
                        principalColumn: "id_inscripcion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_servicios_ef_programa_periodos_id_p~",
                        column: x => x.id_programa_periodo,
                        principalSchema: "public",
                        principalTable: "ef_programa_periodos",
                        principalColumn: "id_programa_periodo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_servicios_ef_programa_servicios_id_~",
                        column: x => x.id_programa_servicio,
                        principalSchema: "public",
                        principalTable: "ef_programa_servicios",
                        principalColumn: "id_programa_servicio",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_servicios_ef_rsvp_grupo_integrantes~",
                        column: x => x.id_rsvp_grupo_integrante,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupo_integrantes",
                        principalColumn: "id_rsvp_grupo_integrante",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_rsvp_integrante_restricciones",
                schema: "public",
                columns: table => new
                {
                    id_rsvp_grupo_integrante = table.Column<long>(type: "bigint", nullable: false),
                    id_restriccion_alim = table.Column<long>(type: "bigint", nullable: false),
                    fecha_alta = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "now()"),
                    observaciones = table.Column<string>(type: "text", nullable: true),
                    severidad = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ef_rsvp_integrante_restricciones_pkey", x => new { x.id_rsvp_grupo_integrante, x.id_restriccion_alim });
                    table.ForeignKey(
                        name: "fk_rir_integrante",
                        column: x => x.id_rsvp_grupo_integrante,
                        principalSchema: "public",
                        principalTable: "ef_rsvp_grupo_integrantes",
                        principalColumn: "id_rsvp_grupo_integrante",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_rir_restr",
                        column: x => x.id_restriccion_alim,
                        principalSchema: "public",
                        principalTable: "ef_param_restricciones_alimentarias",
                        principalColumn: "id_restriccion_alim",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_evento_album_ranking_votos",
                columns: table => new
                {
                    id_voto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_ranking = table.Column<long>(type: "bigint", nullable: false),
                    id_evento = table.Column<long>(type: "bigint", nullable: false),
                    id_foto = table.Column<long>(type: "bigint", nullable: false),
                    device_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    id_invitado = table.Column<long>(type: "bigint", nullable: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_evento_album_ranking_votos", x => x.id_voto);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_ranking_votos_ef_evento_album_fotos_id_foto",
                        column: x => x.id_foto,
                        principalTable: "ef_evento_album_fotos",
                        principalColumn: "id_foto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_ranking_votos_ef_evento_album_rankings_id_r~",
                        column: x => x.id_ranking,
                        principalTable: "ef_evento_album_rankings",
                        principalColumn: "id_ranking",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_ranking_votos_ef_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "ef_eventos",
                        principalColumn: "id_evento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ef_evento_album_ranking_votos_ef_invitados_id_invitado",
                        column: x => x.id_invitado,
                        principalSchema: "public",
                        principalTable: "ef_invitados",
                        principalColumn: "id_invitado");
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_salud_contactos",
                schema: "public",
                columns: table => new
                {
                    id_contacto_emergencia = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_salud_ficha = table.Column<long>(type: "bigint", nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    telefono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    relacion = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_salud_contactos", x => x.id_contacto_emergencia);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_salud_contactos_ef_programa_inscrip~",
                        column: x => x.id_salud_ficha,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripcion_salud_fichas",
                        principalColumn: "id_salud_ficha",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_salud_medicaciones",
                schema: "public",
                columns: table => new
                {
                    id_medicacion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_salud_ficha = table.Column<long>(type: "bigint", nullable: false),
                    nombre_medicacion = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    dosis = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    frecuencia = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    horario = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    indicaciones = table.Column<string>(type: "text", nullable: true),
                    requiere_autorizacion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_salud_medicaciones", x => x.id_medicacion);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_salud_medicaciones_ef_programa_insc~",
                        column: x => x.id_salud_ficha,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripcion_salud_fichas",
                        principalColumn: "id_salud_ficha",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ef_programa_inscripcion_servicio_dias",
                schema: "public",
                columns: table => new
                {
                    id_inscripcion_servicio_dia = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_inscripcion_servicio = table.Column<long>(type: "bigint", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_alta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    fecha_modif = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ef_programa_inscripcion_servicio_dias", x => x.id_inscripcion_servicio_dia);
                    table.ForeignKey(
                        name: "FK_ef_programa_inscripcion_servicio_dias_ef_programa_inscripci~",
                        column: x => x.id_inscripcion_servicio,
                        principalSchema: "public",
                        principalTable: "ef_programa_inscripcion_servicios",
                        principalColumn: "id_inscripcion_servicio",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ef_addon_features_addon",
                schema: "public",
                table: "ef_addon_features",
                column: "id_addon");

            migrationBuilder.CreateIndex(
                name: "ix_ef_addon_features_feature",
                schema: "public",
                table: "ef_addon_features",
                column: "id_feature");

            migrationBuilder.CreateIndex(
                name: "ux_ef_addon_features_addon_feature",
                schema: "public",
                table: "ef_addon_features",
                columns: new[] { "id_addon", "id_feature" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_addons_codigo",
                schema: "public",
                table: "ef_addons",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_acceso",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_acceso_link",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_audiencia_persona",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_audiencia_persona");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_evento",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_invitado",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_eventos_id_unidad",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_unidad");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencia_persona_tags_id_audiencia_persona",
                schema: "public",
                table: "ef_audiencia_persona_tags",
                column: "id_audiencia_persona");

            migrationBuilder.CreateIndex(
                name: "IX_ef_audiencias_personas_id_cuenta",
                schema: "public",
                table: "ef_audiencias_personas",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "IX_ef_autorizaciones_id_evento_id_invitado_objetivo",
                schema: "public",
                table: "ef_autorizaciones",
                columns: new[] { "id_evento", "id_invitado_objetivo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_autorizaciones_id_invitado_objetivo",
                schema: "public",
                table: "ef_autorizaciones",
                column: "id_invitado_objetivo");

            migrationBuilder.CreateIndex(
                name: "ix_ef_autorizaciones_qr_token",
                schema: "public",
                table: "ef_autorizaciones",
                column: "qr_token");

            migrationBuilder.CreateIndex(
                name: "IX_ef_autorizaciones_tipo_activo",
                schema: "public",
                table: "ef_autorizaciones",
                columns: new[] { "tipo", "activo" });

            migrationBuilder.CreateIndex(
                name: "ix_b2b_prospectos_estado",
                schema: "public",
                table: "ef_b2b_prospectos",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "ix_b2b_prospectos_fecha_alta",
                schema: "public",
                table: "ef_b2b_prospectos",
                column: "fecha_alta");

            migrationBuilder.CreateIndex(
                name: "ix_b2b_prospectos_proximo_contacto",
                schema: "public",
                table: "ef_b2b_prospectos",
                column: "proximo_contacto");

            migrationBuilder.CreateIndex(
                name: "IX_ef_b2b_prospectos_id_usuario_asignado",
                schema: "public",
                table: "ef_b2b_prospectos",
                column: "id_usuario_asignado");

            migrationBuilder.CreateIndex(
                name: "ix_b2b_hist_prospecto_fecha",
                schema: "public",
                table: "ef_b2b_prospectos_hist",
                columns: new[] { "id_prospecto", "fecha" });

            migrationBuilder.CreateIndex(
                name: "ix_b2b_hist_tipo",
                schema: "public",
                table: "ef_b2b_prospectos_hist",
                column: "tipo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_b2b_prospectos_hist_id_usuario",
                schema: "public",
                table: "ef_b2b_prospectos_hist",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ix_ef_cliente_unidades_cliente",
                schema: "public",
                table: "ef_cliente_unidades",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "ix_ef_cliente_unidades_unidad",
                schema: "public",
                table: "ef_cliente_unidades",
                column: "id_unidad");

            migrationBuilder.CreateIndex(
                name: "ux_ef_cliente_unidades_cliente_unidad",
                schema: "public",
                table: "ef_cliente_unidades",
                columns: new[] { "id_cliente", "id_unidad" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_clientes_activo_true",
                schema: "public",
                table: "ef_clientes",
                column: "id_cliente",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ix_ef_clientes_id_cuenta",
                schema: "public",
                table: "ef_clientes",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ix_chpib_item",
                schema: "public",
                table: "ef_cuenta_hospedaje_plantilla_item_bloques",
                column: "id_hospedaje_plantilla_item",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_chpi_plantilla",
                schema: "public",
                table: "ef_cuenta_hospedaje_plantilla_items",
                column: "id_hospedaje_plantilla");

            migrationBuilder.CreateIndex(
                name: "ix_chp_cuenta",
                schema: "public",
                table: "ef_cuenta_hospedaje_plantillas",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ix_chp_unidad",
                schema: "public",
                table: "ef_cuenta_hospedaje_plantillas",
                column: "id_unidad");

            migrationBuilder.CreateIndex(
                name: "ix_ef_cuenta_unidades_cuenta",
                schema: "public",
                table: "ef_cuenta_unidades",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ux_ef_cuenta_unidades_cuenta_codigo",
                schema: "public",
                table: "ef_cuenta_unidades",
                columns: new[] { "id_cuenta", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_cui_cuenta",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ix_cui_estado_activo",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                columns: new[] { "estado", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_cuenta_usuario_invitaciones_id_rol",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_cuenta_usuario_invitaciones_id_usuario_acepta",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                column: "id_usuario_acepta");

            migrationBuilder.CreateIndex(
                name: "IX_ef_cuenta_usuario_invitaciones_id_usuario_invita",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                column: "id_usuario_invita");

            migrationBuilder.CreateIndex(
                name: "ux_cui_token",
                schema: "public",
                table: "ef_cuenta_usuario_invitaciones",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_cuenta_usuarios_id_rol",
                schema: "public",
                table: "ef_cuenta_usuarios",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_cuenta_usuarios_id_usuario",
                schema: "public",
                table: "ef_cuenta_usuarios",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_ef_cuenta_usuarios_cuenta_usuario_rol",
                schema: "public",
                table: "ef_cuenta_usuarios",
                columns: new[] { "id_cuenta", "id_usuario", "id_rol" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_cuentas_id_pais",
                schema: "public",
                table: "ef_cuentas",
                column: "id_pais");

            migrationBuilder.CreateIndex(
                name: "ix_ef_cuentas_id_plan",
                schema: "public",
                table: "ef_cuentas",
                column: "id_plan");

            migrationBuilder.CreateIndex(
                name: "ix_ef_cuentas_id_tipo_identificacion_fiscal",
                schema: "public",
                table: "ef_cuentas",
                column: "id_tipo_identificacion_fiscal");

            migrationBuilder.CreateIndex(
                name: "ux_ef_cuentas_nombre",
                schema: "public",
                table: "ef_cuentas",
                column: "nombre_cuenta",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_dress_code_codigo",
                schema: "public",
                table: "ef_dress_code",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_eal_acceso",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "ix_eal_activo",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_acceso_links_id_evento",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_acceso_links_id_tipo_beneficio_registro",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_tipo_beneficio_registro");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_acceso_links_id_usuario_creador",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_usuario_creador");

            migrationBuilder.CreateIndex(
                name: "ux_eal_token",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_acceso_tramos_id_tramo",
                table: "ef_evento_acceso_tramos",
                column: "id_tramo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_accesos_id_evento",
                table: "ef_evento_accesos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_accesos_id_evento_nombre",
                table: "ef_evento_accesos",
                columns: new[] { "id_evento", "nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_estados_hist_id_foto",
                table: "ef_evento_album_estados_hist",
                column: "id_foto");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_estados_hist_id_usuario",
                table: "ef_evento_album_estados_hist",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotocabina_usos_id_evento",
                table: "ef_evento_album_fotocabina_usos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotocabina_usos_id_foto",
                table: "ef_evento_album_fotocabina_usos",
                column: "id_foto");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotocabina_usos_id_invitado",
                table: "ef_evento_album_fotocabina_usos",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotocabina_usos_id_overlay",
                table: "ef_evento_album_fotocabina_usos",
                column: "id_overlay");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotos_id_evento",
                table: "ef_evento_album_fotos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotos_id_invitado",
                table: "ef_evento_album_fotos",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_fotos_id_tramo",
                table: "ef_evento_album_fotos",
                column: "id_tramo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_likes_id_evento",
                table: "ef_evento_album_likes",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_likes_id_invitado",
                table: "ef_evento_album_likes",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_overlays_id_evento",
                table: "ef_evento_album_overlays",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_ranking_votos_id_evento",
                table: "ef_evento_album_ranking_votos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_ranking_votos_id_foto",
                table: "ef_evento_album_ranking_votos",
                column: "id_foto");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_ranking_votos_id_invitado",
                table: "ef_evento_album_ranking_votos",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_ranking_votos_id_ranking_device_id",
                table: "ef_evento_album_ranking_votos",
                columns: new[] { "id_ranking", "device_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_rankings_id_evento",
                table: "ef_evento_album_rankings",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_rankings_id_foto_ganadora",
                table: "ef_evento_album_rankings",
                column: "id_foto_ganadora");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_album_rankings_id_tramo",
                table: "ef_evento_album_rankings",
                column: "id_tramo");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_beneficios_registro_evento_estado",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                columns: new[] { "id_evento", "estado", "fecha_otorgado" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_beneficios_registro_id_acceso_link",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_beneficios_registro_id_tipo_beneficio_registro",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                column: "id_tipo_beneficio_registro");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_beneficios_registro_id_usuario_valida",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                column: "id_usuario_valida");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_beneficios_registro_invitado",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_beneficios_registro_evento_invitado_link_tipo",
                schema: "public",
                table: "ef_evento_beneficios_registro",
                columns: new[] { "id_evento", "id_invitado", "id_acceso_link", "id_tipo_beneficio_registro" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_checkins_id_acceso",
                schema: "public",
                table: "ef_evento_checkins",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_checkins_id_acceso_link",
                schema: "public",
                table: "ef_evento_checkins",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_checkins_id_evento",
                schema: "public",
                table: "ef_evento_checkins",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_checkins_id_invitado",
                schema: "public",
                table: "ef_evento_checkins",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_checkins_id_usuario_operador",
                schema: "public",
                table: "ef_evento_checkins",
                column: "id_usuario_operador");

            migrationBuilder.CreateIndex(
                name: "ix_eer_evento",
                schema: "public",
                table: "ef_evento_edad_rangos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_edad_rangos_ef_param_edad_rangosid_edad_rango",
                schema: "public",
                table: "ef_evento_edad_rangos",
                column: "ef_param_edad_rangosid_edad_rango");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_edad_rangos_id_edad_rango",
                schema: "public",
                table: "ef_evento_edad_rangos",
                column: "id_edad_rango");

            migrationBuilder.CreateIndex(
                name: "ux_eer_evento_codigo",
                schema: "public",
                table: "ef_evento_edad_rangos",
                columns: new[] { "id_evento", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_estados_hist_id_evento",
                schema: "public",
                table: "ef_evento_estados_hist",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_estados_hist_id_usuario",
                schema: "public",
                table: "ef_evento_estados_hist",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_features_activo_true",
                table: "ef_evento_features",
                column: "id_evento",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_features_evento_feature",
                table: "ef_evento_features",
                columns: new[] { "id_evento", "id_feature" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_bloq_hosp",
                schema: "public",
                table: "ef_evento_hospedaje_bloques",
                column: "id_hospedaje");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_hospedajes_id_tramo_referencia",
                schema: "public",
                table: "ef_evento_hospedajes",
                column: "id_tramo_referencia");

            migrationBuilder.CreateIndex(
                name: "ix_hosp_evento",
                schema: "public",
                table: "ef_evento_hospedajes",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_hosp_evento_activo",
                schema: "public",
                table: "ef_evento_hospedajes",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "ux_hosp_evento_orden",
                schema: "public",
                table: "ef_evento_hospedajes",
                columns: new[] { "id_evento", "orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_links_activo_true",
                table: "ef_evento_links",
                column: "id_evento",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_links_evento_tipo",
                table: "ef_evento_links",
                columns: new[] { "id_evento", "tipo" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_links_token",
                table: "ef_evento_links",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_mesa_invitados_id_invitado",
                table: "ef_evento_mesa_invitados",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_mesas_id_tramo",
                table: "ef_evento_mesas",
                column: "id_tramo");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_mus_bloq_activo_true",
                table: "ef_evento_musica_bloqueos",
                column: "id_evento",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_mus_bloq_evento_hash",
                table: "ef_evento_musica_bloqueos",
                columns: new[] { "id_evento", "hash_normalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_mus_momentos_evento",
                table: "ef_evento_musica_momentos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_mus_momentos_evento_nombre",
                table: "ef_evento_musica_momentos",
                columns: new[] { "id_evento", "nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_mus_playlist_evento",
                table: "ef_evento_musica_playlist",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_mus_sug_estado_estado",
                table: "ef_evento_musica_sugerencias_estado",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_mus_sug_estado_evento",
                table: "ef_evento_musica_sugerencias_estado",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_mus_sug_estado_sugerencia",
                table: "ef_evento_musica_sugerencias_estado",
                column: "id_invitado_musica_sugerencia",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_codigo_mercado",
                table: "ef_evento_plan_cambios",
                column: "codigo_mercado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_codigo_moneda",
                table: "ef_evento_plan_cambios",
                column: "codigo_moneda");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_estado_fecha_solicitud",
                table: "ef_evento_plan_cambios",
                columns: new[] { "estado", "fecha_solicitud" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_evento",
                table: "ef_evento_plan_cambios",
                column: "id_evento",
                unique: true,
                filter: "estado = 'PENDIENTE'");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_evento_estado",
                table: "ef_evento_plan_cambios",
                columns: new[] { "id_evento", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_plan_actual",
                table: "ef_evento_plan_cambios",
                column: "id_plan_actual");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_plan_solicitado",
                table: "ef_evento_plan_cambios",
                column: "id_plan_solicitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_usuario_admin",
                table: "ef_evento_plan_cambios",
                column: "id_usuario_admin");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_plan_cambios_id_usuario_solicita_fecha_solicitud",
                table: "ef_evento_plan_cambios",
                columns: new[] { "id_usuario_solicita", "fecha_solicitud" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_portal_config_id_portal_seccion",
                schema: "public",
                table: "ef_evento_portal_config",
                column: "id_portal_seccion");

            migrationBuilder.CreateIndex(
                name: "ux_evento_portal_config_evento_seccion",
                schema: "public",
                table: "ef_evento_portal_config",
                columns: new[] { "id_evento", "id_portal_seccion" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_portal_fotos_id_usuario_carga",
                schema: "public",
                table: "ef_evento_portal_fotos",
                column: "id_usuario_carga");

            migrationBuilder.CreateIndex(
                name: "ix_evento_portal_fotos_evento",
                schema: "public",
                table: "ef_evento_portal_fotos",
                columns: new[] { "id_evento", "visible_portal", "activo", "fecha_foto" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_regalos_fondo_aportes_evento_fecha",
                table: "ef_evento_regalos_fondo_aportes",
                columns: new[] { "id_evento", "fecha_declara" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_regalos_fondo_aportes_fondo_estado",
                table: "ef_evento_regalos_fondo_aportes",
                columns: new[] { "id_fondo", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_regalos_fondo_aportes_id_invitado",
                table: "ef_evento_regalos_fondo_aportes",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_regalos_fondo_aportes_id_usuario_confirma",
                table: "ef_evento_regalos_fondo_aportes",
                column: "id_usuario_confirma");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_regalos_fondo_aportes_meta_estado",
                table: "ef_evento_regalos_fondo_aportes",
                columns: new[] { "id_meta", "estado" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_regalos_fondo_metas_fondo",
                table: "ef_evento_regalos_fondo_metas",
                columns: new[] { "id_fondo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_regalos_fondo_metas_visibles",
                table: "ef_evento_regalos_fondo_metas",
                columns: new[] { "id_evento", "visible", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_regalos_fondos_id_evento",
                table: "ef_evento_regalos_fondos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_lista_items_evento",
                table: "ef_evento_regalos_lista_items",
                columns: new[] { "id_evento", "orden" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_lista_items_visibles",
                table: "ef_evento_regalos_lista_items",
                columns: new[] { "id_evento", "visible", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_regalos_lista_reservas_id_invitado",
                table: "ef_evento_regalos_lista_reservas",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_lista_reservas_evento_fecha",
                table: "ef_evento_regalos_lista_reservas",
                columns: new[] { "id_evento", "fecha_reserva" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_lista_reservas_item_estado",
                table: "ef_evento_regalos_lista_reservas",
                columns: new[] { "id_regalo_item", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_regalos_transferencias_codigo_moneda",
                table: "ef_evento_regalos_transferencias",
                column: "codigo_moneda");

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_transf_evento",
                table: "ef_evento_regalos_transferencias",
                columns: new[] { "id_evento", "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_transf_moneda",
                table: "ef_evento_regalos_transferencias",
                columns: new[] { "id_evento", "codigo_moneda", "activo" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_regalos_transf_cfg_evento",
                table: "ef_evento_regalos_transferencias_config",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_staff_id_rol",
                schema: "public",
                table: "ef_evento_staff",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_staff_id_staff",
                schema: "public",
                table: "ef_evento_staff",
                column: "id_staff");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_staff_evento_staff_rol",
                schema: "public",
                table: "ef_evento_staff",
                columns: new[] { "id_evento", "id_staff", "id_rol" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_tramos_id_evento",
                table: "ef_evento_tramos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_tramos_id_evento_orden",
                table: "ef_evento_tramos",
                columns: new[] { "id_evento", "orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_tramos_id_tramo_tipo",
                table: "ef_evento_tramos",
                column: "id_tramo_tipo");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_transporte_activo",
                schema: "public",
                table: "ef_evento_transporte",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "ix_ef_evento_transporte_pro_config_evento",
                schema: "public",
                table: "ef_evento_transporte_pro_config",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_usuarios_id_rol",
                schema: "public",
                table: "ef_evento_usuarios",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_usuarios_id_staff",
                schema: "public",
                table: "ef_evento_usuarios",
                column: "id_staff");

            migrationBuilder.CreateIndex(
                name: "IX_ef_evento_usuarios_id_usuario",
                schema: "public",
                table: "ef_evento_usuarios",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_ef_evento_usuarios_evento_usuario_rol",
                schema: "public",
                table: "ef_evento_usuarios",
                columns: new[] { "id_evento", "id_usuario", "id_rol" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ef_eventos_rsvp_public_token_key",
                schema: "public",
                table: "ef_eventos",
                column: "rsvp_public_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_acceso_default",
                schema: "public",
                table: "ef_eventos",
                column: "id_acceso_default");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_id_cliente",
                schema: "public",
                table: "ef_eventos",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_id_cuenta",
                schema: "public",
                table: "ef_eventos",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_dress_code",
                schema: "public",
                table: "ef_eventos",
                column: "id_dress_code");

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_idioma",
                schema: "public",
                table: "ef_eventos",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_pais",
                schema: "public",
                table: "ef_eventos",
                column: "id_pais");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_id_plan",
                schema: "public",
                table: "ef_eventos",
                column: "id_plan");

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_tipo_evento",
                schema: "public",
                table: "ef_eventos",
                column: "id_tipo_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_id_unidad",
                schema: "public",
                table: "ef_eventos",
                column: "id_unidad");

            migrationBuilder.CreateIndex(
                name: "IX_ef_eventos_id_usuario_rsvp_link_creator",
                schema: "public",
                table: "ef_eventos",
                column: "id_usuario_rsvp_link_creator");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_programa_fechas",
                schema: "public",
                table: "ef_eventos",
                columns: new[] { "fecha_inicio", "fecha_fin" },
                filter: "tipo_operacion = 'PROGRAMA'");

            migrationBuilder.CreateIndex(
                name: "ix_ef_eventos_tipo_operacion",
                schema: "public",
                table: "ef_eventos",
                column: "tipo_operacion");

            migrationBuilder.CreateIndex(
                name: "ix_ef_hospedaje_tags_activo_orden",
                schema: "public",
                table: "ef_hospedaje_tags",
                columns: new[] { "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_hospedaje_tags_codigo",
                schema: "public",
                table: "ef_hospedaje_tags",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_idiomas_activo_true",
                table: "ef_idiomas",
                column: "id_idioma",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ux_ef_idiomas_locale",
                table: "ef_idiomas",
                column: "locale",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitado_intereses_evento_id_interes_evento_publico",
                schema: "public",
                table: "ef_invitado_intereses_evento",
                column: "id_interes_evento_publico");

            migrationBuilder.CreateIndex(
                name: "ix_ef_inv_mus_sug_evento",
                table: "ef_invitado_musica_sugerencias",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_inv_mus_sug_invitado",
                table: "ef_invitado_musica_sugerencias",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "ux_ef_inv_mus_sug_invitado_hash",
                table: "ef_invitado_musica_sugerencias",
                columns: new[] { "id_invitado", "hash_normalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_inv_mus_voto_evento",
                table: "ef_invitado_musica_votos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ux_ef_inv_mus_voto_evento_invitado",
                table: "ef_invitado_musica_votos",
                columns: new[] { "id_evento", "id_invitado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitado_perfiles_id_perfil_asistencia",
                schema: "public",
                table: "ef_invitado_perfiles",
                column: "id_perfil_asistencia");

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitado_preferencias_musicales_id_preferencia_musical",
                schema: "public",
                table: "ef_invitado_preferencias_musicales",
                column: "id_preferencia_musical");

            migrationBuilder.CreateIndex(
                name: "ix_ef_invitados_acceso_link",
                schema: "public",
                table: "ef_invitados",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitados_id_acceso",
                schema: "public",
                table: "ef_invitados",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitados_id_evento",
                schema: "public",
                table: "ef_invitados",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitados_id_rsvp_grupo",
                schema: "public",
                table: "ef_invitados",
                column: "id_rsvp_grupo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_invitados_id_usuario_invitador",
                schema: "public",
                table: "ef_invitados",
                column: "id_usuario_invitador");

            migrationBuilder.CreateIndex(
                name: "IX_ef_mercado_paises_codigo_mercado_id_pais",
                table: "ef_mercado_paises",
                columns: new[] { "codigo_mercado", "id_pais" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_mercado_paises_id_pais_activo",
                table: "ef_mercado_paises",
                columns: new[] { "id_pais", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_mercados_codigo_moneda_default",
                table: "ef_mercados",
                column: "codigo_moneda_default");

            migrationBuilder.CreateIndex(
                name: "ix_ef_pagos_suscripcion",
                schema: "public",
                table: "ef_pagos",
                column: "id_suscripcion");

            migrationBuilder.CreateIndex(
                name: "ux_ef_pagos_idempotency_key",
                schema: "public",
                table: "ef_pagos",
                column: "idempotency_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_paises_codigo_iso2",
                schema: "public",
                table: "ef_paises",
                column: "codigo_iso2",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_paises_codigo_iso3",
                schema: "public",
                table: "ef_paises",
                column: "codigo_iso3",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_audiencia_tags_manual",
                schema: "public",
                table: "ef_param_audiencia_tags",
                columns: new[] { "permite_asignacion_manual", "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_audiencia_tags_tipo",
                schema: "public",
                table: "ef_param_audiencia_tags",
                columns: new[] { "tag_tipo", "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_audiencia_tags",
                schema: "public",
                table: "ef_param_audiencia_tags",
                columns: new[] { "tag_tipo", "tag_valor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_edad_rangos_codigo",
                schema: "public",
                table: "ef_param_edad_rangos",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_entidades_activo_orden",
                table: "ef_param_entidades",
                columns: new[] { "activo", "grupo_menu", "orden_menu" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_entidades_descripcion",
                table: "ef_param_entidades",
                column: "descripcion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_feature_dep_requiere",
                table: "ef_param_feature_dependencias",
                column: "id_feature_requiere");

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_features_activo_true",
                table: "ef_param_features",
                column: "id_feature",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_features_codigo",
                table: "ef_param_features",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_limites_codigo",
                schema: "public",
                table: "ef_param_limites",
                column: "codigo_limite",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_param_medios_pago_codigo",
                table: "ef_param_medios_pago",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_param_portal_secciones_codigo",
                schema: "public",
                table: "ef_param_portal_secciones",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_param_programa_autorizacion_base_traducciones_id_idioma",
                schema: "public",
                table: "ef_param_programa_autorizacion_base_traducciones",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_aut_base_trad_base_idioma",
                schema: "public",
                table: "ef_param_programa_autorizacion_base_traducciones",
                columns: new[] { "id_autorizacion_base", "id_idioma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_autorizaciones_base_codigo",
                schema: "public",
                table: "ef_param_programa_autorizaciones_base",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_salud_tipos_accion_codigo",
                schema: "public",
                table: "ef_param_programa_salud_tipos_accion",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_param_programa_servicio_base_traducciones_id_idioma",
                schema: "public",
                table: "ef_param_programa_servicio_base_traducciones",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_serv_base_trad_servicio_idioma",
                schema: "public",
                table: "ef_param_programa_servicio_base_traducciones",
                columns: new[] { "id_servicio_base", "id_idioma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_servicios_base_codigo",
                schema: "public",
                table: "ef_param_programa_servicios_base",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_param_prog_tipo_ajuste_codigo",
                schema: "public",
                table: "ef_param_programa_tipos_ajuste",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_tipos_calculo_codigo",
                schema: "public",
                table: "ef_param_programa_tipos_calculo",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_programa_tipos_campo_extra_codigo",
                schema: "public",
                table: "ef_param_programa_tipos_campo_extra",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_restriccion_activo",
                schema: "public",
                table: "ef_param_restricciones_alimentarias",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "ix_restr_activo_orden",
                schema: "public",
                table: "ef_param_restricciones_alimentarias",
                columns: new[] { "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_restriccion_codigo",
                schema: "public",
                table: "ef_param_restricciones_alimentarias",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_param_tipos_beneficio_registro_activo_orden",
                schema: "public",
                table: "ef_param_tipos_beneficio_registro",
                columns: new[] { "activo", "orden" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_param_tipos_beneficio_registro_codigo",
                schema: "public",
                table: "ef_param_tipos_beneficio_registro",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_param_traducciones_id_idioma",
                table: "ef_param_traducciones",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "ux_param_trad_entidad_item_idioma",
                table: "ef_param_traducciones",
                columns: new[] { "entidad", "id_item", "id_idioma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_plan_features_feature",
                schema: "public",
                table: "ef_plan_features",
                column: "id_feature");

            migrationBuilder.CreateIndex(
                name: "ix_ef_plan_features_plan",
                schema: "public",
                table: "ef_plan_features",
                column: "id_plan");

            migrationBuilder.CreateIndex(
                name: "ux_ef_plan_features_plan_feature",
                schema: "public",
                table: "ef_plan_features",
                columns: new[] { "id_plan", "id_feature" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_plan_limites_plan",
                schema: "public",
                table: "ef_plan_limites",
                column: "id_plan");

            migrationBuilder.CreateIndex(
                name: "ux_ef_plan_limites_plan_codigo",
                schema: "public",
                table: "ef_plan_limites",
                columns: new[] { "id_plan", "codigo_limite" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_planes_codigo",
                schema: "public",
                table: "ef_planes",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_plantilla_acceso_tramos_id_plantilla_tramo",
                table: "ef_plantilla_acceso_tramos",
                column: "id_plantilla_tramo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_plantilla_accesos_id_plantilla_orden",
                table: "ef_plantilla_accesos",
                columns: new[] { "id_plantilla", "orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_plantilla_tramos_id_plantilla_orden",
                table: "ef_plantilla_tramos",
                columns: new[] { "id_plantilla", "orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_plantilla_tramos_id_tramo_tipo",
                table: "ef_plantilla_tramos",
                column: "id_tramo_tipo");

            migrationBuilder.CreateIndex(
                name: "IX_ef_plantillas_evento_codigo",
                table: "ef_plantillas_evento",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_plantillas_evento_tipo",
                table: "ef_plantillas_evento",
                column: "id_tipo_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_precios_codigo_mercado_codigo_moneda_activo",
                table: "ef_precios",
                columns: new[] { "codigo_mercado", "codigo_moneda", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_precios_codigo_moneda",
                table: "ef_precios",
                column: "codigo_moneda");

            migrationBuilder.CreateIndex(
                name: "IX_ef_precios_id_addon_codigo_mercado_codigo_moneda_activo_vig~",
                table: "ef_precios",
                columns: new[] { "id_addon", "codigo_mercado", "codigo_moneda", "activo", "vigente_desde" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_precios_id_plan_codigo_mercado_codigo_moneda_activo_vige~",
                table: "ef_precios",
                columns: new[] { "id_plan", "codigo_mercado", "codigo_moneda", "activo", "vigente_desde" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_autorizacion_config_traducciones_id_idioma",
                schema: "public",
                table: "ef_programa_autorizacion_config_traducciones",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "ux_prog_aut_config_trad_config_idioma",
                schema: "public",
                table: "ef_programa_autorizacion_config_traducciones",
                columns: new[] { "id_programa_autorizacion_config", "id_idioma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_aut_config_evento",
                schema: "public",
                table: "ef_programa_autorizaciones_config",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_autorizaciones_config_id_autorizacion_base",
                schema: "public",
                table: "ef_programa_autorizaciones_config",
                column: "id_autorizacion_base");

            migrationBuilder.CreateIndex(
                name: "ux_ef_programa_aut_config_evento_base",
                schema: "public",
                table: "ef_programa_autorizaciones_config",
                columns: new[] { "id_evento", "id_autorizacion_base" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_inscripcion_ajustes_id_tipo_ajuste",
                schema: "public",
                table: "ef_programa_inscripcion_ajustes",
                column: "id_tipo_ajuste");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_ajuste_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_ajustes",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_aut_config",
                schema: "public",
                table: "ef_programa_inscripcion_autorizaciones",
                column: "id_programa_autorizacion_config");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_aut_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_autorizaciones",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_aut_integrante",
                schema: "public",
                table: "ef_programa_inscripcion_autorizaciones",
                column: "id_rsvp_grupo_integrante");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_aut",
                schema: "public",
                table: "ef_programa_inscripcion_autorizaciones",
                columns: new[] { "id_inscripcion", "id_programa_autorizacion_config", "id_rsvp_grupo_integrante" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_pago_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_pagos",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_per_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_periodos",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_per_integrante",
                schema: "public",
                table: "ef_programa_inscripcion_periodos",
                column: "id_rsvp_grupo_integrante");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_per_periodo",
                schema: "public",
                table: "ef_programa_inscripcion_periodos",
                column: "id_programa_periodo");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_per_integrante_periodo",
                schema: "public",
                table: "ef_programa_inscripcion_periodos",
                columns: new[] { "id_inscripcion", "id_rsvp_grupo_integrante", "id_programa_periodo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_salud_contacto_ficha",
                schema: "public",
                table: "ef_programa_inscripcion_salud_contactos",
                column: "id_salud_ficha");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_salud_ficha_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_salud_fichas",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_salud_ficha_integrante",
                schema: "public",
                table: "ef_programa_inscripcion_salud_fichas",
                column: "id_rsvp_grupo_integrante");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_salud_ficha_integrante",
                schema: "public",
                table: "ef_programa_inscripcion_salud_fichas",
                columns: new[] { "id_inscripcion", "id_rsvp_grupo_integrante" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_salud_medicacion_ficha",
                schema: "public",
                table: "ef_programa_inscripcion_salud_medicaciones",
                column: "id_salud_ficha");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_dia_fecha",
                schema: "public",
                table: "ef_programa_inscripcion_servicio_dias",
                column: "fecha");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_dia_servicio",
                schema: "public",
                table: "ef_programa_inscripcion_servicio_dias",
                column: "id_inscripcion_servicio");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_serv_dia",
                schema: "public",
                table: "ef_programa_inscripcion_servicio_dias",
                columns: new[] { "id_inscripcion_servicio", "fecha" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_inscripcion",
                schema: "public",
                table: "ef_programa_inscripcion_servicios",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_integrante",
                schema: "public",
                table: "ef_programa_inscripcion_servicios",
                column: "id_rsvp_grupo_integrante");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_periodo",
                schema: "public",
                table: "ef_programa_inscripcion_servicios",
                column: "id_programa_periodo");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_serv_servicio",
                schema: "public",
                table: "ef_programa_inscripcion_servicios",
                column: "id_programa_servicio");

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_inscripciones_id_acceso",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_inscripciones_id_acceso_link",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_inscripciones_id_audiencia_persona_responsable",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_audiencia_persona_responsable");

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_inscripciones_id_idioma",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_idioma");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_email",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "responsable_email");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_evento",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_evento_estado",
                schema: "public",
                table: "ef_programa_inscripciones",
                columns: new[] { "id_evento", "estado" });

            migrationBuilder.CreateIndex(
                name: "ix_prog_insc_inv_responsable",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_invitado_responsable");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_rsvp_grupo",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "id_rsvp_grupo",
                unique: true,
                filter: "id_rsvp_grupo is not null");

            migrationBuilder.CreateIndex(
                name: "ux_prog_insc_token_consulta",
                schema: "public",
                table: "ef_programa_inscripciones",
                column: "token_consulta",
                unique: true,
                filter: "token_consulta is not null");

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_periodos_evento",
                schema: "public",
                table: "ef_programa_periodos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_periodos_evento_activo",
                schema: "public",
                table: "ef_programa_periodos",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_periodos_fechas",
                schema: "public",
                table: "ef_programa_periodos",
                columns: new[] { "fecha_desde", "fecha_hasta" });

            migrationBuilder.CreateIndex(
                name: "ux_ef_programa_periodos_evento_codigo",
                schema: "public",
                table: "ef_programa_periodos",
                columns: new[] { "id_evento", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_salud_acciones_id_participante",
                schema: "public",
                table: "ef_programa_salud_acciones",
                column: "id_participante");

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_salud_acciones_usuario_registro",
                schema: "public",
                table: "ef_programa_salud_acciones",
                column: "usuario_registro");

            migrationBuilder.CreateIndex(
                name: "ix_prog_salud_acc_activo",
                schema: "public",
                table: "ef_programa_salud_acciones",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "ix_prog_salud_acc_evento",
                schema: "public",
                table: "ef_programa_salud_acciones",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_prog_salud_acc_evento_fecha",
                schema: "public",
                table: "ef_programa_salud_acciones",
                columns: new[] { "id_evento", "fecha_hora" });

            migrationBuilder.CreateIndex(
                name: "ix_prog_salud_acc_inscripcion",
                schema: "public",
                table: "ef_programa_salud_acciones",
                column: "id_inscripcion");

            migrationBuilder.CreateIndex(
                name: "ux_programa_salud_config_evento",
                schema: "public",
                table: "ef_programa_salud_config",
                column: "id_evento",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_servicios_evento",
                schema: "public",
                table: "ef_programa_servicios",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_programa_servicios_evento_activo",
                schema: "public",
                table: "ef_programa_servicios",
                columns: new[] { "id_evento", "activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ef_programa_servicios_id_servicio_base",
                schema: "public",
                table: "ef_programa_servicios",
                column: "id_servicio_base");

            migrationBuilder.CreateIndex(
                name: "ux_ef_programa_servicios_evento_codigo",
                schema: "public",
                table: "ef_programa_servicios",
                columns: new[] { "id_evento", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_qr_scans_id_invitado",
                schema: "public",
                table: "ef_qr_scans",
                column: "id_invitado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_qr_scans_id_usuario_operador",
                schema: "public",
                table: "ef_qr_scans",
                column: "id_usuario_operador");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_evento_fecha",
                schema: "public",
                table: "ef_qr_scans",
                columns: new[] { "id_evento", "fecha_scan" });

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_qr",
                schema: "public",
                table: "ef_qr_scans",
                column: "qr_token");

            migrationBuilder.CreateIndex(
                name: "IX_ef_retiros_id_autorizacion",
                schema: "public",
                table: "ef_retiros",
                column: "id_autorizacion");

            migrationBuilder.CreateIndex(
                name: "IX_ef_retiros_id_usuario_operador",
                schema: "public",
                table: "ef_retiros",
                column: "id_usuario_operador");

            migrationBuilder.CreateIndex(
                name: "ix_retiros_evento_fecha",
                schema: "public",
                table: "ef_retiros",
                columns: new[] { "id_evento", "fecha_retiro" });

            migrationBuilder.CreateIndex(
                name: "ix_retiros_evento_nino",
                schema: "public",
                table: "ef_retiros",
                columns: new[] { "id_evento", "id_invitado_nino" });

            migrationBuilder.CreateIndex(
                name: "ix_retiros_nino_fecha",
                schema: "public",
                table: "ef_retiros",
                columns: new[] { "id_invitado_nino", "fecha_retiro" });

            migrationBuilder.CreateIndex(
                name: "ux_retiros_unico_por_nino_dia",
                schema: "public",
                table: "ef_retiros",
                columns: new[] { "id_evento", "id_invitado_nino", "fecha_operativa" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rgi_evento_edad",
                schema: "public",
                table: "ef_rsvp_grupo_integrantes",
                column: "id_evento_edad_rango");

            migrationBuilder.CreateIndex(
                name: "ux_rgi_invitado",
                schema: "public",
                table: "ef_rsvp_grupo_integrantes",
                column: "id_invitado",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_rgi_un_titular_por_grupo",
                schema: "public",
                table: "ef_rsvp_grupo_integrantes",
                column: "id_rsvp_grupo",
                unique: true,
                filter: "rol = 'T'");

            migrationBuilder.CreateIndex(
                name: "IX_ef_rsvp_grupos_id_acceso",
                schema: "public",
                table: "ef_rsvp_grupos",
                column: "id_acceso");

            migrationBuilder.CreateIndex(
                name: "ix_rg_evento",
                schema: "public",
                table: "ef_rsvp_grupos",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_rg_evento_estado",
                schema: "public",
                table: "ef_rsvp_grupos",
                columns: new[] { "id_evento", "rsvp_estado" });

            migrationBuilder.CreateIndex(
                name: "ix_rg_link",
                schema: "public",
                table: "ef_rsvp_grupos",
                column: "id_acceso_link");

            migrationBuilder.CreateIndex(
                name: "IX_ef_rsvp_integrante_restricciones_id_restriccion_alim",
                schema: "public",
                table: "ef_rsvp_integrante_restricciones",
                column: "id_restriccion_alim");

            migrationBuilder.CreateIndex(
                name: "ix_ef_scope_addons_addon",
                schema: "public",
                table: "ef_scope_addons",
                column: "id_addon");

            migrationBuilder.CreateIndex(
                name: "ix_ef_scope_addons_cuenta",
                schema: "public",
                table: "ef_scope_addons",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ix_ef_scope_addons_evento",
                schema: "public",
                table: "ef_scope_addons",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_solicitudes_plantilla_estado",
                table: "ef_solicitudes_plantilla",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "IX_ef_solicitudes_plantilla_id_evento",
                table: "ef_solicitudes_plantilla",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_solicitudes_plantilla_tipo",
                table: "ef_solicitudes_plantilla",
                column: "id_tipo_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_staff_codigo",
                table: "ef_staff",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_staff_id_cuenta",
                table: "ef_staff",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "IX_ef_staff_id_evento",
                table: "ef_staff",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "IX_ef_staff_id_rol",
                table: "ef_staff",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_staff_unidades_id_unidad",
                table: "ef_staff_unidades",
                column: "id_unidad");

            migrationBuilder.CreateIndex(
                name: "ix_ef_suscripciones_cuenta",
                schema: "public",
                table: "ef_suscripciones",
                column: "id_cuenta");

            migrationBuilder.CreateIndex(
                name: "ix_ef_suscripciones_evento",
                schema: "public",
                table: "ef_suscripciones",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_tipos_evento_tipo_operacion",
                table: "ef_tipos_evento",
                column: "tipo_operacion");

            migrationBuilder.CreateIndex(
                name: "ux_ef_tipos_evento_codigo",
                table: "ef_tipos_evento",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_tif_id_pais",
                schema: "public",
                table: "ef_tipos_identificacion_fiscal",
                column: "id_pais");

            migrationBuilder.CreateIndex(
                name: "ux_ef_tif_codigo_pais",
                schema: "public",
                table: "ef_tipos_identificacion_fiscal",
                columns: new[] { "codigo", "id_pais" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ef_tramo_tipos_codigo",
                table: "ef_tramo_tipos",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ef_usuarios_activo_true",
                schema: "public",
                table: "ef_usuarios",
                column: "id_usuario",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "ix_ef_usuarios_id_idioma_default_evento",
                schema: "public",
                table: "ef_usuarios",
                column: "id_idioma_default_evento");

            migrationBuilder.CreateIndex(
                name: "ix_ef_usuarios_id_idioma_preferido",
                schema: "public",
                table: "ef_usuarios",
                column: "id_idioma_preferido");

            migrationBuilder.CreateIndex(
                name: "ix_ef_usuarios_id_pais",
                schema: "public",
                table: "ef_usuarios",
                column: "id_pais");

            migrationBuilder.CreateIndex(
                name: "ux_ef_usuarios_email",
                schema: "public",
                table: "ef_usuarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_usuarios_google_sub",
                schema: "public",
                table: "ef_usuarios",
                column: "google_sub",
                unique: true,
                filter: "google_sub is not null");

            migrationBuilder.CreateIndex(
                name: "ix_ef_usuario_roles_activo_true",
                table: "ef_usuarios_roles",
                column: "id_usuario_rol",
                filter: "activo = true");

            migrationBuilder.CreateIndex(
                name: "IX_ef_usuarios_roles_rolid_rol",
                table: "ef_usuarios_roles",
                column: "rolid_rol");

            migrationBuilder.CreateIndex(
                name: "IX_ef_usuarios_roles_usuarioid_usuario",
                table: "ef_usuarios_roles",
                column: "usuarioid_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_ef_usuario_roles_usuario_rol",
                table: "ef_usuarios_roles",
                columns: new[] { "id_usuario", "id_rol" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_ef_webhook_eventos_provider_event",
                schema: "public",
                table: "ef_webhook_eventos",
                columns: new[] { "external_provider", "external_event_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_portal_acceso_IdPortalPersona",
                schema: "public",
                table: "portal_acceso",
                column: "IdPortalPersona");

            migrationBuilder.CreateIndex(
                name: "IX_portal_acceso_TokenConsulta",
                schema: "public",
                table: "portal_acceso",
                column: "TokenConsulta",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_portal_persona_Email",
                schema: "public",
                table: "portal_persona",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_portal_persona_Telefono",
                schema: "public",
                table: "portal_persona",
                column: "Telefono");

            migrationBuilder.CreateIndex(
                name: "IX_portal_verificacion_TokenConsulta",
                schema: "public",
                table: "portal_verificacion",
                column: "TokenConsulta");

            migrationBuilder.AddForeignKey(
                name: "FK_ef_audiencia_persona_eventos_ef_evento_acceso_links_id_acce~",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_acceso_link",
                principalSchema: "public",
                principalTable: "ef_evento_acceso_links",
                principalColumn: "id_acceso_link",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_audiencia_persona_eventos_ef_evento_accesos_id_acceso",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_acceso",
                principalTable: "ef_evento_accesos",
                principalColumn: "id_acceso",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_audiencia_persona_eventos_ef_eventos_id_evento",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_evento",
                principalSchema: "public",
                principalTable: "ef_eventos",
                principalColumn: "id_evento",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_audiencia_persona_eventos_ef_invitados_id_invitado",
                schema: "public",
                table: "ef_audiencia_persona_eventos",
                column: "id_invitado",
                principalSchema: "public",
                principalTable: "ef_invitados",
                principalColumn: "id_invitado",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_autorizaciones_ef_eventos_id_evento",
                schema: "public",
                table: "ef_autorizaciones",
                column: "id_evento",
                principalSchema: "public",
                principalTable: "ef_eventos",
                principalColumn: "id_evento",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_autorizaciones_ef_invitados_id_invitado_objetivo",
                schema: "public",
                table: "ef_autorizaciones",
                column: "id_invitado_objetivo",
                principalSchema: "public",
                principalTable: "ef_invitados",
                principalColumn: "id_invitado",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_evento_acceso_links_ef_eventos_id_evento",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_evento",
                principalSchema: "public",
                principalTable: "ef_eventos",
                principalColumn: "id_evento",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_eal_acceso",
                schema: "public",
                table: "ef_evento_acceso_links",
                column: "id_acceso",
                principalTable: "ef_evento_accesos",
                principalColumn: "id_acceso",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_evento_acceso_tramos_ef_evento_accesos_id_acceso",
                table: "ef_evento_acceso_tramos",
                column: "id_acceso",
                principalTable: "ef_evento_accesos",
                principalColumn: "id_acceso",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_evento_acceso_tramos_ef_evento_tramos_id_tramo",
                table: "ef_evento_acceso_tramos",
                column: "id_tramo",
                principalTable: "ef_evento_tramos",
                principalColumn: "id_tramo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ef_evento_accesos_ef_eventos_id_evento",
                table: "ef_evento_accesos",
                column: "id_evento",
                principalSchema: "public",
                principalTable: "ef_eventos",
                principalColumn: "id_evento",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ef_eventos_ef_cuenta_unidades_id_unidad",
                schema: "public",
                table: "ef_eventos");

            migrationBuilder.DropForeignKey(
                name: "FK_ef_eventos_ef_evento_accesos_id_acceso_default",
                schema: "public",
                table: "ef_eventos");

            migrationBuilder.DropTable(
                name: "ef_addon_features",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_audiencia_persona_eventos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_audiencia_persona_tags",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_b2b_prospectos_hist",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cliente_unidades",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_hospedaje_plantilla_item_bloques",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_usuario_invitaciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_usuarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_acceso_tramos");

            migrationBuilder.DropTable(
                name: "ef_evento_album_config");

            migrationBuilder.DropTable(
                name: "ef_evento_album_estados_hist");

            migrationBuilder.DropTable(
                name: "ef_evento_album_fotocabina_usos");

            migrationBuilder.DropTable(
                name: "ef_evento_album_likes");

            migrationBuilder.DropTable(
                name: "ef_evento_album_ranking_votos");

            migrationBuilder.DropTable(
                name: "ef_evento_beneficios_registro",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_checkins",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_estados_hist",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_features");

            migrationBuilder.DropTable(
                name: "ef_evento_hospedaje_bloques",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_links");

            migrationBuilder.DropTable(
                name: "ef_evento_mesa_invitados");

            migrationBuilder.DropTable(
                name: "ef_evento_musica_bloqueos");

            migrationBuilder.DropTable(
                name: "ef_evento_musica_momentos");

            migrationBuilder.DropTable(
                name: "ef_evento_musica_playlist");

            migrationBuilder.DropTable(
                name: "ef_evento_musica_sugerencias_estado");

            migrationBuilder.DropTable(
                name: "ef_evento_plan_cambios");

            migrationBuilder.DropTable(
                name: "ef_evento_portal_config",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_portal_fotos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_fondo_aportes");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_lista_reservas");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_transferencias");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_transferencias_config");

            migrationBuilder.DropTable(
                name: "ef_evento_staff",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_transporte",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_transporte_pro_config",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_usuarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_hospedaje_tags",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_invitado_intereses_evento",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_invitado_musica_sugerencias");

            migrationBuilder.DropTable(
                name: "ef_invitado_musica_votos");

            migrationBuilder.DropTable(
                name: "ef_invitado_perfiles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_invitado_preferencias_musicales",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_mercado_paises");

            migrationBuilder.DropTable(
                name: "ef_pagos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_audiencia_tags",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_entidades");

            migrationBuilder.DropTable(
                name: "ef_param_feature_dependencias");

            migrationBuilder.DropTable(
                name: "ef_param_features");

            migrationBuilder.DropTable(
                name: "ef_param_limites",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_medios_pago");

            migrationBuilder.DropTable(
                name: "ef_param_programa_autorizacion_base_traducciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_programa_salud_tipos_accion",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_programa_servicio_base_traducciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_programa_tipos_calculo",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_programa_tipos_campo_extra",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_traducciones");

            migrationBuilder.DropTable(
                name: "ef_plan_features",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_plan_limites",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_plantilla_acceso_tramos");

            migrationBuilder.DropTable(
                name: "ef_precios");

            migrationBuilder.DropTable(
                name: "ef_programa_autorizacion_config_traducciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_ajustes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_autorizaciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_pagos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_periodos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_salud_contactos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_salud_medicaciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_servicio_dias",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_salud_acciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_salud_config",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_qr_scans",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_retiros",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_rsvp_integrante_restricciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_scope_addons",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_solicitudes_plantilla");

            migrationBuilder.DropTable(
                name: "ef_staff_unidades");

            migrationBuilder.DropTable(
                name: "ef_suscripciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_usuarios_roles");

            migrationBuilder.DropTable(
                name: "ef_webhook_eventos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "portal_acceso",
                schema: "public");

            migrationBuilder.DropTable(
                name: "portal_verificacion",
                schema: "public");

            migrationBuilder.DropTable(
                name: "vw_param_faltante_row");

            migrationBuilder.DropTable(
                name: "vw_param_faltantes_resumen_row");

            migrationBuilder.DropTable(
                name: "ef_b2b_prospectos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_hospedaje_plantilla_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_album_overlays");

            migrationBuilder.DropTable(
                name: "ef_evento_album_rankings");

            migrationBuilder.DropTable(
                name: "ef_evento_hospedajes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_mesas");

            migrationBuilder.DropTable(
                name: "ef_param_portal_secciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_fondo_metas");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_lista_items");

            migrationBuilder.DropTable(
                name: "ef_param_intereses_evento_publico",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_perfiles_asistencia",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_preferencias_musicales",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_plantilla_accesos");

            migrationBuilder.DropTable(
                name: "ef_plantilla_tramos");

            migrationBuilder.DropTable(
                name: "ef_addons",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_mercados");

            migrationBuilder.DropTable(
                name: "ef_param_programa_tipos_ajuste",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_autorizaciones_config",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_salud_fichas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripcion_servicios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_autorizaciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_restricciones_alimentarias",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_staff");

            migrationBuilder.DropTable(
                name: "portal_persona",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_hospedaje_plantillas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_album_fotos");

            migrationBuilder.DropTable(
                name: "ef_evento_regalos_fondos");

            migrationBuilder.DropTable(
                name: "ef_plantillas_evento");

            migrationBuilder.DropTable(
                name: "ef_monedas");

            migrationBuilder.DropTable(
                name: "ef_param_programa_autorizaciones_base",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_inscripciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_periodos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_programa_servicios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_rsvp_grupo_integrantes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_roles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_tramos");

            migrationBuilder.DropTable(
                name: "ef_audiencias_personas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_programa_servicios_base",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_edad_rangos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_invitados",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_tramo_tipos");

            migrationBuilder.DropTable(
                name: "ef_param_edad_rangos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_rsvp_grupos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_acceso_links",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_param_tipos_beneficio_registro",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuenta_unidades",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_evento_accesos");

            migrationBuilder.DropTable(
                name: "ef_eventos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_clientes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_dress_code",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_tipos_evento");

            migrationBuilder.DropTable(
                name: "ef_usuarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_cuentas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_idiomas");

            migrationBuilder.DropTable(
                name: "ef_planes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_tipos_identificacion_fiscal",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ef_paises",
                schema: "public");
        }
    }
}
