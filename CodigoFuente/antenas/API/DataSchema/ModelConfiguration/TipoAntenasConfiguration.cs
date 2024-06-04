using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class TipoAntenasConfiguration : IEntityTypeConfiguration<TipoAntenas>
    {
        public void Configure(EntityTypeBuilder<TipoAntenas> builder) 
        {
            builder
               .HasKey(k => k.IdTipoAntena);
            
            builder
                .Property(p => p.Nombre)
                .IsRequired(true);
        }
    }

}