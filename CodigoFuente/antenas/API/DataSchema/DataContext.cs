using API.DataSchema.ModelConfiguration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace API.DataSchema
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {

            //this.ChangeTracker.LazyLoadingEnabled = false;
            //this.Configuration.LazyLoadingEnabled = false;
            //ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }
        
        public DbSet<MEC_CarRevista> MEC_CarRevista { get; set; }
        public DbSet<MEC_Conceptos> MEC_Conceptos { get; set; }
        public DbSet<MEC_TiposEstablecimientos> MEC_TiposEstablecimientos { get; set; }
        public DbSet<MEC_Establecimientos> MEC_Establecimientos { get; set; }
        public DbSet<MEC_TiposCategorias> MEC_TiposCategorias { get; set; }
        public DbSet<MEC_Personas> MEC_Personas { get; set; }
        public DbSet<MEC_POF> MEC_POF { get; set; }
        public DbSet<MEC_TiposLiquidaciones> MEC_TiposLiquidaciones { get; set; }
        public DbSet<MEC_CabeceraLiquidacion> MEC_CabeceraLiquidacion { get; set; }
        public DbSet<MEC_TiposFunciones> MEC_TiposFunciones { get; set; }
        public DbSet<MEC_TMPMecanizadas> MEC_TMPMecanizadas { get; set; }
        public DbSet<MEC_TMPErroresEstablecimientos> MEC_TMPErroresEstablecimientos { get; set; }
        public DbSet<MEC_TMPErroresFuncion> MEC_TMPErroresFuncion { get; set; }
        public DbSet<MEC_TMPErroresConceptos> MEC_TMPErroresConceptos { get; set; }
        public DbSet<MEC_TMPErroresCarRevista> MEC_TMPErroresCarRevista { get; set; }
        public DbSet<MEC_TMPErroresTiposEstablecimientos> MEC_TMPErroresTiposEstablecimientos { get; set; }
        public DbSet<MEC_TMPErroresMecanizadas> MEC_TMPErroresMecanizadas { get; set; }
        public DbSet<MEC_POF_Antiguedades> MEC_POF_Antiguedades { get; set; }
        public DbSet<MEC_InasistenciasCabecera> MEC_InasistenciasCabecera{ get; set; }
        public DbSet<MEC_InasistenciasDetalle> MEC_InasistenciasDetalle { get; set; }
        public DbSet<MEC_Mecanizadas> MEC_Mecanizadas { get; set; }
        public DbSet<MEC_Usuarios> MEC_Usuarios { get; set; }
        public DbSet<MEC_Roles> MEC_Roles { get; set; }
        public DbSet<MEC_RolesXUsuarios> MEC_RolesXUsuarios { get; set; }
        public DbSet<MEC_UsuariosEstablecimientos> MEC_UsuariosEstablecimientos { get; set; }
        public DbSet<MEC_CabeceraLiquidacionEstados> MEC_CabeceraLiquidacionEstados { get; set; }
        public DbSet<MEC_BajasCabecera> MEC_BajasCabecera { get; set; }
        public DbSet<MEC_BajasDetalle> MEC_BajasDetalle { get; set; } 
        public DbSet<MEC_MotivosBajas> MEC_MotivosBajas { get; set; }
        public DbSet<MEC_POFDetalle> MEC_POFDetalle { get; set; }
        public DbSet<MEC_MotivosBajasDoc> MEC_MotivosBajasDoc { get; set; }
        public DbSet<MEC_MotivosBajasDoc> MEC_TiposMovimientos { get; set; }
        public DbSet<MEC_MovimientosCabecera> MEC_MovimientosCabecera { get; set; }
        public DbSet<MEC_MovimientosDetalle> MEC_MovimientosDetalle { get; set; }
        public DbSet<MEC_MovimientosBajas> MEC_MovimientosBajas { get; set; }
        public DbSet<MEC_POF_Barras> MEC_POF_Barras { get; set; }
        public DbSet<MEC_InasistenciasCodigos> MEC_InasistenciasCodigos { get; set; }
        public DbSet<MEC_TMPInasistenciasDetalle> MEC_TMPInasistenciasDetalle { get; set; }
        public DbSet<MEC_InasistenciasRechazo> MEC_InasistenciasRechazo { get; set; }
        public DbSet<MEC_TMPErroresInasistenciasDetalle> MEC_TMPErroresInasistenciasDetalle { get; set; }
        public DbSet<MEC_MovimientosSuperCabecera> MEC_MovimientosSuperCabecera { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new MEC_CarRevistaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_ConceptosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_EstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposCategoriasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_PersonasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POFConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposLiquidacionesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_CabeceraLiquidacionConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposFuncionesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPMecanizadaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresFuncionConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresConceptosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresCarRevistaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresTipoEstablecimientoConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresMecanizadasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POF_AntiguedadesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MecanizadasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_UsuariosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RolesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RolesXUsuariosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_UsuariosEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_CabeceraLiquidacionEstadosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_BajasCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_BajasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MotivosBajasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POFDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MotivosBajasDocConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposMovimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosBajasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POF_BarrasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasCodigosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPInasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresInasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasRechazoConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosSuperCabeceraConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}