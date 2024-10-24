using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresEstablecimientosConfiguration : IEntityTypeConfiguration<MEC_TMPErroresEstablecimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresEstablecimientos> builder)
        {
            builder
                .HasKey(k => k.IdTMPErrorEstablecimiento);

            builder
                .Property(p => p.IdTMPErrorEstablecimiento)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.Cabecera)
                .WithOne()
                .HasForeignKey<MEC_CabeceraLiquidacion>(e => e.IdCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.NroEstab)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(false);
        }
    }
}
