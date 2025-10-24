using API.DataSchema.ModelConfiguration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using static Bogus.Person.CardAddress;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace API.DataSchema
{
    public class EFIDBContext : DbContext
    {
        public EFIDBContext(DbContextOptions<EFIDBContext> options) : base(options)
        {

            //this.ChangeTracker.LazyLoadingEnabled = false;
            //this.Configuration.LazyLoadingEnabled = false;
            //ChangeTracker.QueryT  rackingBehavior = QueryTrackingBehavior.NoTracking;
        }

        public DbSet<Cargos> Cargos { get; set; }
        public DbSet<Legajo> Legajos { get; set; }
        public DbSet<Nomen> Nomen { get; set; }
        public DbSet<Caradesi> Caradesi { get; set; }
        public DbSet<TipoDesi> TipoDesi { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("liqhab");
            base.OnModelCreating(modelBuilder);
        }

        // Bloquea escritura (solo lectura)
        public override int SaveChanges()
            => throw new InvalidOperationException("Este contexto es de solo lectura.");

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => throw new InvalidOperationException("Este contexto es de solo lectura.");
    }
 }