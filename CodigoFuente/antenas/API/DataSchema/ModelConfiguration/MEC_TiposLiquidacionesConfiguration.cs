using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TiposLiquidacionesConfiguration : IEntityTypeConfiguration<MEC_TiposLiquidaciones>
    {
        public void Configure(EntityTypeBuilder<MEC_TiposLiquidaciones> builder)
        {
            builder
                .HasKey(k => k.IdTipoLiquidacion);

            builder
                .Property(p => p.IdTipoLiquidacion)
                .UseIdentityColumn()
                .ValueGeneratedOnAdd();
          
            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true); 

            builder.Property(e => e.Vigente)    
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

        }
    }
}
