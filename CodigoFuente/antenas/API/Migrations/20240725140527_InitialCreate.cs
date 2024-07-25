using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ANT_Apoderados",
                columns: table => new
                {
                    IdApoderado = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    NroDoc = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Apoderados", x => x.IdApoderado);
                });

            migrationBuilder.CreateTable(
                name: "ANT_EstadoTramites",
                columns: table => new
                {
                    IdEstadoTramite = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_EstadoTramites", x => x.IdEstadoTramite);
                });

            migrationBuilder.CreateTable(
                name: "ANT_Prestadores",
                columns: table => new
                {
                    IdPrestador = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdApoderado = table.Column<int>(type: "integer", nullable: false),
                    Cuit = table.Column<int>(type: "integer", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    RazonSocial = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Prestadores", x => x.IdPrestador);
                });

            migrationBuilder.CreateTable(
                name: "ANT_TipoAntenas",
                columns: table => new
                {
                    IdTipoAntena = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_TipoAntenas", x => x.IdTipoAntena);
                });

            migrationBuilder.CreateTable(
                name: "ANT_Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Usuarios", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "ANT_ApoderadosANT_Prestadores",
                columns: table => new
                {
                    ApoderadosIdApoderado = table.Column<int>(type: "integer", nullable: false),
                    PrestadorIdPrestador = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_ApoderadosANT_Prestadores", x => new { x.ApoderadosIdApoderado, x.PrestadorIdPrestador });
                    table.ForeignKey(
                        name: "FK_ANT_ApoderadosANT_Prestadores_ANT_Apoderados_ApoderadosIdAp~",
                        column: x => x.ApoderadosIdApoderado,
                        principalTable: "ANT_Apoderados",
                        principalColumn: "IdApoderado",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ANT_ApoderadosANT_Prestadores_ANT_Prestadores_PrestadorIdPr~",
                        column: x => x.PrestadorIdPrestador,
                        principalTable: "ANT_Prestadores",
                        principalColumn: "IdPrestador",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ANT_Antenas",
                columns: table => new
                {
                    IdAntena = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdTipoAntena = table.Column<int>(type: "integer", nullable: false),
                    IdPrestador = table.Column<int>(type: "integer", nullable: true),
                    IdExpediente = table.Column<int>(type: "integer", nullable: true),
                    AlturaSoporte = table.Column<float>(type: "real", nullable: false),
                    AlturaTotal = table.Column<float>(type: "real", nullable: false),
                    CellId = table.Column<string>(type: "text", nullable: false),
                    CodigoSitio = table.Column<int>(type: "integer", nullable: false),
                    Declarada = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Emplazamiento = table.Column<string>(type: "text", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: false),
                    SalaEquipos = table.Column<string>(type: "text", nullable: false),
                    TipoMimetizado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Antenas", x => x.IdAntena);
                    table.ForeignKey(
                        name: "FK_ANT_Antenas_ANT_Prestadores_IdPrestador",
                        column: x => x.IdPrestador,
                        principalTable: "ANT_Prestadores",
                        principalColumn: "IdPrestador");
                    table.ForeignKey(
                        name: "FK_ANT_Antenas_ANT_TipoAntenas_IdTipoAntena",
                        column: x => x.IdTipoAntena,
                        principalTable: "ANT_TipoAntenas",
                        principalColumn: "IdTipoAntena",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ANT_Expedientes",
                columns: table => new
                {
                    IdExpediente = table.Column<int>(type: "integer", nullable: false),
                    IdEstadoTramite = table.Column<int>(type: "integer", nullable: true),
                    AcometidaEnergia = table.Column<string>(type: "text", nullable: false),
                    ActaAsamblea = table.Column<string>(type: "text", nullable: false),
                    AEnacom = table.Column<string>(type: "text", nullable: false),
                    ANAC = table.Column<string>(type: "text", nullable: false),
                    CertificadoDominio = table.Column<string>(type: "text", nullable: false),
                    CompromisoDesmonte = table.Column<string>(type: "text", nullable: false),
                    ConstanciaPago = table.Column<string>(type: "text", nullable: false),
                    ContratoLocacion = table.Column<string>(type: "text", nullable: false),
                    ContratoRepresentante = table.Column<string>(type: "text", nullable: false),
                    ContratoResponsableSH = table.Column<string>(type: "text", nullable: false),
                    CopiaConvenioCNC = table.Column<string>(type: "text", nullable: false),
                    CronogramaObra = table.Column<string>(type: "text", nullable: false),
                    CuadroPotencia = table.Column<string>(type: "text", nullable: false),
                    CuadroVerifConduc = table.Column<string>(type: "text", nullable: false),
                    FactAmbienteBA = table.Column<string>(type: "text", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaTasaA = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ImpactoAmbiental = table.Column<string>(type: "text", nullable: false),
                    LayoutElectrica = table.Column<string>(type: "text", nullable: false),
                    LibreDeuda = table.Column<string>(type: "text", nullable: false),
                    MedicionRadiacion = table.Column<string>(type: "text", nullable: false),
                    MemoriaCalculo = table.Column<string>(type: "text", nullable: false),
                    NombreExp = table.Column<string>(type: "text", nullable: false),
                    NroExpediente = table.Column<string>(type: "text", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: false),
                    OrdenamientoTerritorial = table.Column<string>(type: "text", nullable: false),
                    PermisoAmbiental = table.Column<string>(type: "text", nullable: false),
                    PlanoCivil = table.Column<string>(type: "text", nullable: false),
                    PlanoConstruccion = table.Column<string>(type: "text", nullable: false),
                    Planos = table.Column<string>(type: "text", nullable: false),
                    PoderTramite = table.Column<string>(type: "text", nullable: false),
                    PolizaSeguroCT = table.Column<string>(type: "text", nullable: false),
                    RegistroDGOP = table.Column<string>(type: "text", nullable: false),
                    ReglamentoCopropiedad = table.Column<string>(type: "text", nullable: false),
                    SeguridadHigiene = table.Column<string>(type: "text", nullable: false),
                    SeguroRespCivil = table.Column<string>(type: "text", nullable: false),
                    SistBaliza = table.Column<string>(type: "text", nullable: false),
                    SistProtAtmos = table.Column<string>(type: "text", nullable: false),
                    SistPuestaTierra = table.Column<string>(type: "text", nullable: false),
                    TasaAnual = table.Column<string>(type: "text", nullable: false),
                    TasaSigem = table.Column<string>(type: "text", nullable: false),
                    UnifiliarGral = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Expedientes", x => x.IdExpediente);
                    table.ForeignKey(
                        name: "FK_ANT_Expedientes_ANT_Antenas_IdExpediente",
                        column: x => x.IdExpediente,
                        principalTable: "ANT_Antenas",
                        principalColumn: "IdAntena",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ANT_Expedientes_ANT_EstadoTramites_IdEstadoTramite",
                        column: x => x.IdEstadoTramite,
                        principalTable: "ANT_EstadoTramites",
                        principalColumn: "IdEstadoTramite");
                });

            migrationBuilder.CreateTable(
                name: "ANT_Inspecciones",
                columns: table => new
                {
                    IdInspeccion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdAntena = table.Column<int>(type: "integer", nullable: false),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    AlambradoPerimetral = table.Column<string>(type: "text", nullable: false),
                    AnilloTierra = table.Column<string>(type: "text", nullable: false),
                    BalizaFlash = table.Column<string>(type: "text", nullable: false),
                    BarraEquipos = table.Column<string>(type: "text", nullable: false),
                    BarraEstructura = table.Column<string>(type: "text", nullable: false),
                    BaseConcreto = table.Column<string>(type: "text", nullable: false),
                    BaseConcretoPrin = table.Column<string>(type: "text", nullable: false),
                    Bulones = table.Column<string>(type: "text", nullable: false),
                    CableAlimentacion = table.Column<string>(type: "text", nullable: false),
                    CableDescarga = table.Column<string>(type: "text", nullable: false),
                    CamaraInspeccion = table.Column<string>(type: "text", nullable: false),
                    CamaraPararrayos = table.Column<string>(type: "text", nullable: false),
                    CamarasInspec = table.Column<string>(type: "text", nullable: false),
                    CamarasPase = table.Column<string>(type: "text", nullable: false),
                    CanalPilar = table.Column<string>(type: "text", nullable: false),
                    ConexionBarra = table.Column<string>(type: "text", nullable: false),
                    ConexionChasis = table.Column<string>(type: "text", nullable: false),
                    ConexionEstAnillo = table.Column<string>(type: "text", nullable: false),
                    ConexionTierra = table.Column<string>(type: "text", nullable: false),
                    Desmalezado = table.Column<string>(type: "text", nullable: false),
                    DesplaFisuras = table.Column<string>(type: "text", nullable: false),
                    ErosionTerreno = table.Column<string>(type: "text", nullable: false),
                    EscaleraGuarda = table.Column<string>(type: "text", nullable: false),
                    EstadoFotocelula = table.Column<string>(type: "text", nullable: false),
                    EstadoGral = table.Column<string>(type: "text", nullable: false),
                    EstanqueCañerias = table.Column<string>(type: "text", nullable: false),
                    EstrTransicion = table.Column<string>(type: "text", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    GrasaAntiox = table.Column<string>(type: "text", nullable: false),
                    Grietas = table.Column<string>(type: "text", nullable: false),
                    IluminacionBanquina = table.Column<string>(type: "text", nullable: false),
                    LucesBaliza = table.Column<string>(type: "text", nullable: false),
                    Mastil = table.Column<string>(type: "text", nullable: false),
                    ObjetosExtraños = table.Column<string>(type: "text", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: false),
                    ObstruccionesCaños = table.Column<string>(type: "text", nullable: false),
                    PedestalConcreto = table.Column<string>(type: "text", nullable: false),
                    PernosFijaEstructura = table.Column<string>(type: "text", nullable: false),
                    PernosFijaGabinetes = table.Column<string>(type: "text", nullable: false),
                    PernosFijaPedestales = table.Column<string>(type: "text", nullable: false),
                    PernosFijaPerfil = table.Column<string>(type: "text", nullable: false),
                    PernosViga = table.Column<string>(type: "text", nullable: false),
                    PilarMedicion = table.Column<string>(type: "text", nullable: false),
                    PinturaBaliza = table.Column<string>(type: "text", nullable: false),
                    PinturaBanquina = table.Column<string>(type: "text", nullable: false),
                    PlataformasInspeccion = table.Column<string>(type: "text", nullable: false),
                    PortoAcceso = table.Column<string>(type: "text", nullable: false),
                    ProteccionTermo = table.Column<string>(type: "text", nullable: false),
                    PuertaBanquina = table.Column<string>(type: "text", nullable: false),
                    PuntaCaptora = table.Column<string>(type: "text", nullable: false),
                    PuntosHumedad = table.Column<string>(type: "text", nullable: false),
                    Razon = table.Column<string>(type: "text", nullable: false),
                    RoturaPedestales = table.Column<string>(type: "text", nullable: false),
                    SalvaCaidas = table.Column<string>(type: "text", nullable: false),
                    SimboloRiesgoElec = table.Column<string>(type: "text", nullable: false),
                    SoporteBalizas = table.Column<string>(type: "text", nullable: false),
                    SoportesBandejas = table.Column<string>(type: "text", nullable: false),
                    SoportesCañerias = table.Column<string>(type: "text", nullable: false),
                    SoportesFijaciones = table.Column<string>(type: "text", nullable: false),
                    TableroBaliza = table.Column<string>(type: "text", nullable: false),
                    TableroEmergencia = table.Column<string>(type: "text", nullable: false),
                    TableroGralCA = table.Column<string>(type: "text", nullable: false),
                    TableroPrincipal = table.Column<string>(type: "text", nullable: false),
                    UCLA = table.Column<string>(type: "text", nullable: false),
                    UnionesTramos = table.Column<string>(type: "text", nullable: false),
                    Verticalidad = table.Column<string>(type: "text", nullable: false),
                    VigaEquipos = table.Column<string>(type: "text", nullable: false),
                    Visibilidad = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANT_Inspecciones", x => x.IdInspeccion);
                    table.ForeignKey(
                        name: "FK_ANT_Inspecciones_ANT_Antenas_IdAntena",
                        column: x => x.IdAntena,
                        principalTable: "ANT_Antenas",
                        principalColumn: "IdAntena",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ANT_Antenas_IdPrestador",
                table: "ANT_Antenas",
                column: "IdPrestador");

            migrationBuilder.CreateIndex(
                name: "IX_ANT_Antenas_IdTipoAntena",
                table: "ANT_Antenas",
                column: "IdTipoAntena");

            migrationBuilder.CreateIndex(
                name: "IX_ANT_ApoderadosANT_Prestadores_PrestadorIdPrestador",
                table: "ANT_ApoderadosANT_Prestadores",
                column: "PrestadorIdPrestador");

            migrationBuilder.CreateIndex(
                name: "IX_ANT_Expedientes_IdEstadoTramite",
                table: "ANT_Expedientes",
                column: "IdEstadoTramite");

            migrationBuilder.CreateIndex(
                name: "IX_ANT_Inspecciones_IdAntena",
                table: "ANT_Inspecciones",
                column: "IdAntena");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ANT_ApoderadosANT_Prestadores");

            migrationBuilder.DropTable(
                name: "ANT_Expedientes");

            migrationBuilder.DropTable(
                name: "ANT_Inspecciones");

            migrationBuilder.DropTable(
                name: "ANT_Usuarios");

            migrationBuilder.DropTable(
                name: "ANT_Apoderados");

            migrationBuilder.DropTable(
                name: "ANT_EstadoTramites");

            migrationBuilder.DropTable(
                name: "ANT_Antenas");

            migrationBuilder.DropTable(
                name: "ANT_Prestadores");

            migrationBuilder.DropTable(
                name: "ANT_TipoAntenas");
        }
    }
}
