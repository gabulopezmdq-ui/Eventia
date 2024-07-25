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

        public DbSet<ANT_Usuario> ANT_Usuarios { get; set; }
        public DbSet<ANT_Antenas> ANT_Antenas { get; set; }
        public DbSet<ANT_Apoderados> ANT_Apoderados { get; set; }
        public DbSet<ANT_EstadoTramites> ANT_EstadoTramites { get; set; }
        public DbSet<ANT_Expedientes> ANT_Expedientes { get; set; }
        public DbSet<ANT_Inspecciones> ANT_Inspecciones { get; set; }
        public DbSet<ANT_Prestadores> ANT_Prestadores { get; set; }
        public DbSet<ANT_TipoAntenas> ANT_TipoAntenas { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new ANT_UsuarioConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_ExpedientesConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_TipoAntenasConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_AntenasConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_ApoderadosConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_EstadoTramiteConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_PrestadoresConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_InspeccionesConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}