using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_CabeceraLiquidacionEstadosConfiguration: IEntityTypeConfiguration<MEC_CabeceraLiquidacionEstados>
    {
        public void Configure(EntityTypeBuilder<MEC_CabeceraLiquidacionEstados> builder)
        {
            builder
                .HasKey(k => k.IdCabeceraEstado);

            builder
               .Property(e => e.IdCabeceraEstado)
               .ValueGeneratedOnAdd();
            builder
                .HasOne(e => e.Cabecera)
                .WithMany(e => e.EstadoCabecera)
                .HasForeignKey(e => e.IdCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Estado)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Observaciones)
                .HasColumnType("char(100)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.FechaCambioEstado)
                .IsRequired(true);

        }
    }
}
