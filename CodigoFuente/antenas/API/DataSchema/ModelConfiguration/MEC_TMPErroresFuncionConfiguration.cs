using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresFuncionConfiguration : IEntityTypeConfiguration<MEC_TMPErroresFuncion>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresFuncion> builder)
        {
            builder
                .HasKey(k => k.IdTMPErrorFuncion);

            builder
                .Property(p => p.IdTMPErrorFuncion)
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

            builder.Property(e => e.CodFuncion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(false); 
        }
    }
}
