using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TiposEstablecimientosConfiguration : IEntityTypeConfiguration<MEC_TiposEstablecimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_TiposEstablecimientos> builder)
        {
            builder
                .HasKey(k => k.IdTipoEstablecimiento);

            builder
                .Property(p => p.IdTipoEstablecimiento)
                .ValueGeneratedOnAdd();
                

            builder.Property(e => e.CodTipoEstablecimiento)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true); // si quieres que sea NOT NULL

            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(50)")
                .IsFixedLength(false)
                .IsRequired(true); 

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

        }
    }
}
