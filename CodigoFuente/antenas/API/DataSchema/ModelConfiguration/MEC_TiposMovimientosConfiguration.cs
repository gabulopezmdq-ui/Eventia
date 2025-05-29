using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TiposMovimientosConfiguration : IEntityTypeConfiguration<MEC_TiposMovimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_TiposMovimientos> builder)
        {
            builder
               .HasKey(k => k.IdTipoMovimiento);

            builder
                .Property(p => p.IdTipoMovimiento)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.TipoMovimiento)
               .HasColumnType("char(1)")
               .IsRequired(true);

            builder.Property(p => p.Leyenda)
                .HasColumnType("varchar(2000)");

            builder
               .Property(p => p.Vigente)
               .HasColumnType("char(1)")
               .IsFixedLength(true);
        }
    }
}
