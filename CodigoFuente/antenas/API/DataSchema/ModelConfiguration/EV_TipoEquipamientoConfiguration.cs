using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_TipoEquipamientoConfiguration : IEntityTypeConfiguration<EV_TipoEquipamiento>
    {
        public void Configure(EntityTypeBuilder<EV_TipoEquipamiento> builder) 
        {
            builder
               .HasKey(k => k.IdTipoEquipamiento);

            builder
                .Property(p => p.IdTipoEquipamiento)
                .ValueGeneratedOnAdd();
            
        }
    }

}