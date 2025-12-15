using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_RetencionesConfiguration : IEntityTypeConfiguration<MEC_Retenciones>
    {
        public void Configure(EntityTypeBuilder<MEC_Retenciones> builder) 
        {
            builder
               .HasKey(k => k.IdRetencion);

            builder
                .Property(k => k.IdRetencion)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Descripcion)
               .HasColumnType("varchar(50)")
                .IsRequired(true);

            builder
               .Property(p => p.Vigente)
               .HasColumnType("char(1)")
               .IsFixedLength(true);
        }
    }

}