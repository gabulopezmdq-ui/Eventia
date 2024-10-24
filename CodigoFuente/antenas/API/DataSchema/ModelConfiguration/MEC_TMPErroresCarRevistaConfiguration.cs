using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresCarRevistaConfiguration : IEntityTypeConfiguration<MEC_TMPErroresCarRevista>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresCarRevista> builder)
        {
            builder
                .HasKey(k => k.IdTMPErrorCarRevista);

            builder
                .Property(p => p.IdTMPErrorCarRevista)
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

            builder.Property(e => e.CaracterRevista)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(false); 
        }
    }
}
