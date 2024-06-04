using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_VelocidadesConfiguration : IEntityTypeConfiguration<EV_Velocidades>
    {
        public void Configure(EntityTypeBuilder<EV_Velocidades> builder) 
        {
            builder
               .HasKey(k => k.IdVelocidad);
          
        }
    }

}