using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MovimientosSuperCabeceraConfiguration : IEntityTypeConfiguration<MEC_MovimientosSuperCabecera>
    {
        public void Configure(EntityTypeBuilder<MEC_MovimientosSuperCabecera> builder)
        {
            builder
                .HasKey(k => k.IdSuperCabecera);

            builder
                .Property(p => p.IdSuperCabecera)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.Establecimiento)
                .WithMany(t => t.SuperCabecera)
                .HasForeignKey(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Area)
              .HasColumnType("char(1)")
              .IsFixedLength(false)
              .IsRequired(true);

            builder.Property(e => e.Fecha)
                .IsRequired(true);


        }
    }
}
