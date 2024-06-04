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
        public DbSet<Antenas> Antenas { get; set; }
        public DbSet<Apoderados> Apoderados { get; set; }
        public DbSet<ApoderadoXPrestador> ApoderadoXPrestador { get; set; } 
        public DbSet<EstadoTramite> EstadoTramites { get; set; }
        public DbSet<Expediente> Expedientes { get; set; }
        public DbSet<Inspecciones> Inspecciones { get; set; }
        public DbSet<Leyenda> Leyendas { get; set; }
        public DbSet<Prestadores> Prestadores { get; set; }
        public DbSet<TipoAntenas> TipoAntenas { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new UsuarioConfiguration());
            modelBuilder.ApplyConfiguration(new TipoAntenasConfiguration());
            modelBuilder.ApplyConfiguration(new AntenasConfiguration());
            modelBuilder.ApplyConfiguration(new LeyendaConfiguration());
            modelBuilder.ApplyConfiguration(new ApoderadosConfiguration());
            modelBuilder.ApplyConfiguration(new ApoderadoXPrestadorConfiguration());
            modelBuilder.ApplyConfiguration(new EstadoTramiteConfiguration());
            modelBuilder.ApplyConfiguration(new PrestadoresConfiguration());
            modelBuilder.ApplyConfiguration(new InspeccionesConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}