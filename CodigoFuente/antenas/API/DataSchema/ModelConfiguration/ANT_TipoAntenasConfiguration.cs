using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class ANT_TipoAntenasConfiguration : IEntityTypeConfiguration<ANT_TipoAntenas>
    {
        public void Configure(EntityTypeBuilder<ANT_TipoAntenas> builder) 
        {
            builder
               .HasKey(k => k.IdTipoAntena);

            builder
                .Property(k => k.IdTipoAntena)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Nombre)
                .IsRequired(true);
        }
    }

}