using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_RepTecnicoConfiguration : IEntityTypeConfiguration<EV_RepTecnico>
    {
        public void Configure(EntityTypeBuilder<EV_RepTecnico> builder) 
        {
            builder
               .HasKey(k => k.IdRepTecnico);
            
            builder
                .Property(p => p.IdRepTecnico)
                .ValueGeneratedOnAdd();
        }
    }

}