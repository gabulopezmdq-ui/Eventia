using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_TipoObraConfiguration : IEntityTypeConfiguration<EV_TipoObra>
    {
        public void Configure(EntityTypeBuilder<EV_TipoObra> builder) 
        {
            builder
               .HasKey(k => k.IdTipoObra);
            
            builder
                .Property(p => p.IdTipoObra)
                .ValueGeneratedOnAdd();
        }
    }

}