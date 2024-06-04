using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ApoderadosConfiguration:IEntityTypeConfiguration<Apoderados>
    {
        public void Configure(EntityTypeBuilder<Apoderados> builder) 
        {
            builder
                .HasKey(k => k.IdApoderado);
            builder
                .Property(p => p.Nombre)
                .IsRequired(true);
            builder
                .Property(p => p.Apelllido)
                .IsRequired(true);
            builder
                .Property(p => p.NroDoc)
                .IsRequired(true);
        }
    }
}
