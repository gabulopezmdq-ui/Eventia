using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresTipoEstablecimientoConfiguration : IEntityTypeConfiguration<MEC_TMPErroresTiposEstablecimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresTiposEstablecimientos> builder)
        {
            builder
                .HasKey(k => k.IdTMPErrorTipoEstablecimiento);

            builder
                .Property(p => p.IdTMPErrorTipoEstablecimiento)
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

            builder.Property(e => e.TipoOrganizacion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(false); 
        }
    }
}
