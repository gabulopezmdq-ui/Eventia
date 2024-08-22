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
        public DbSet<MEC_Conceptos> MEC_Personas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new MEC_CarRevistaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_ConceptosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_EstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_PersonasConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}