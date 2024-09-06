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
        public DbSet<MEC_Conceptos> MEC_TiposEstablecimientos { get; set; }
        public DbSet<MEC_Conceptos> MEC_Establecimientos { get; set; }
        public DbSet<MEC_TiposCategorias> MEC_TiposCategorias { get; set; }
        public DbSet<MEC_Conceptos> MEC_Personas { get; set; }
        public DbSet<MEC_POF> MEC_POF { get; set; }
        public DbSet<MEC_TiposLiquidaciones> MEC_TiposLiquidaciones { get; set; }
        public DbSet<MEC_CabeceraLiquidacion> MEC_CabeceraLiquidacion { get; set; }
        public DbSet<MEC_TiposFunciones> MEC_TiposFunciones { get; set; }
        public DbSet<MEC_TMPMecanizadas> MEC_TMPMecanizadas { get; set; }
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
            base.OnModelCreating(modelBuilder);
        }
    }
}