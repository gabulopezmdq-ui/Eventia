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

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<ANT_Antenas> Antenas { get; set; }
        public DbSet<ANT_Apoderados> Apoderados { get; set; }
        public DbSet<ANT_EstadoTramite> EstadoTramites { get; set; }
        public DbSet<ANT_Expedientes> Expedientes { get; set; }
        public DbSet<ANT_Inspecciones> Inspecciones { get; set; }
        public DbSet<ANT_Prestadores> Prestadores { get; set; }
        public DbSet<ANT_TipoAntenas> TipoAntenas { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new ANT_UsuarioConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_TipoAntenasConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_AntenasConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_ApoderadosConfiguration());
            modelBuilder.ApplyConfiguration(new EstadoTramiteConfiguration());
            modelBuilder.ApplyConfiguration(new PrestadoresConfiguration());
            modelBuilder.ApplyConfiguration(new ANT_InspeccionesConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}