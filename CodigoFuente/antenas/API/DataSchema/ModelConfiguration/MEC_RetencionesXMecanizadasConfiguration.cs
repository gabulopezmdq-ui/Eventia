using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_RetencionesXMecanizadasConfiguration : IEntityTypeConfiguration<MEC_RetencionesXMecanizadas>
    {
        public void Configure(EntityTypeBuilder<MEC_RetencionesXMecanizadas> builder) 
        {
            builder
               .HasKey(k => k.IdRetencionXMecanizada);

            builder
                .Property(k => k.IdRetencionXMecanizada)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Importe)
                .IsRequired(true);

            builder
               .HasOne(e => e.Retencion)
               .WithMany(e => e.RetencionesXMecanizadas)
               .HasForeignKey(e => e.IdRetencion)
               .IsRequired(true);

            builder
                .Navigation(e => e.Retencion)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(e => e.Mecanizada)
               .WithMany(e => e.RetencionesXMecanizadas)
               .HasForeignKey(e => e.IdMecanizada)
               .IsRequired(true);

            builder
                .Navigation(e => e.Mecanizada)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(e => e.Establecimiento)
               .WithMany(e => e.RetencionesXMecanizadas)
               .HasForeignKey(e => e.IdEstablecimiento)
               .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }

}