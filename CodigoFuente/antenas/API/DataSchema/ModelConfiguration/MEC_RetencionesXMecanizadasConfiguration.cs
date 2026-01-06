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

            builder.Property(e => e.Signo)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(true);

            builder.Property(e => e.Vigente)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

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
               .HasOne(e => e.Establecimiento)
               .WithMany(e => e.RetencionesXMecanizadas)
               .HasForeignKey(e => e.IdEstablecimiento)
               .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(e => e.Cabecera)
               .WithMany(e => e.RetencionesXMecanizadas)
               .HasForeignKey(e => e.IdCabecera)
               .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }

}