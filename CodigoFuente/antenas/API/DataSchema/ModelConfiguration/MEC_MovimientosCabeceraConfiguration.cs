using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MovimientosCabeceraConfiguration : IEntityTypeConfiguration<MEC_MovimientosCabecera>
    {
        public void Configure(EntityTypeBuilder<MEC_MovimientosCabecera> builder)
        {
            builder
                .HasKey(k => k.IdMovimientoCabecera);

            builder
                .Property(p => p.IdMovimientoCabecera)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.Establecimientos)
                .WithMany(t => t.Movimientos)
                .HasForeignKey(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimientos)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Mes)
                .IsRequired(true);

            builder.Property(e => e.Anio)
                .IsRequired(true);

            builder.Property(e => e.Fecha)
                .IsRequired(true);

            builder.Property(e => e.Modificaciones)
               .IsRequired(false);

            builder.Property(e => e.Altas)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.Bajas)
                 .HasColumnType("char(1)")
                 .IsFixedLength(true)
                 .IsRequired(false);

            builder.Property(e => e.Adicionales)
               .HasColumnType("char(1)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.Observaciones)
            .HasColumnType("char(1000)")
            .IsFixedLength(true)
            .IsRequired(true);

            builder.Property(e => e.Estado)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(true);

        }
    }
}
