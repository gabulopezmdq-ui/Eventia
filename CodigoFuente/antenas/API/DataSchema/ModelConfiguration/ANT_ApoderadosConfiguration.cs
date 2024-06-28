using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ANT_ApoderadosConfiguration:IEntityTypeConfiguration<ANT_Apoderados>
    {
        public void Configure(EntityTypeBuilder<ANT_Apoderados> builder) 
        {
            builder
                .HasKey(k => k.IdApoderado);

            builder
                .HasMany(e => e.Prestador)
                .WithMany(e => e.Apoderados);

            builder
                .Property(k => k.IdApoderado)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Nombre)
                .IsRequired(true);

            builder
                .Property(p => p.Apellido)
                .IsRequired(true);

            builder
                .Property(p => p.NroDoc)
                .IsRequired(true);
        }
    }
}
