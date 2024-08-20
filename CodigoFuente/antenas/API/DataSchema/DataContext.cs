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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new MEC_CarRevistaConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}