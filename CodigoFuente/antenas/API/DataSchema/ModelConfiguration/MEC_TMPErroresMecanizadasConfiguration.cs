using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresMecanizadasConfiguration : IEntityTypeConfiguration<MEC_TMPErroresMecanizadas>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresMecanizadas> builder)
        {
            builder
                .HasKey(k => k.IdTMPErrorMecanizada);

            builder
                .Property(p => p.IdTMPErrorMecanizada)
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

            builder.Property(e => e.Documento)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.POF)
               .HasColumnType("char(2)")
               .IsFixedLength(true)
               .IsRequired(false);
        }
    }
}
