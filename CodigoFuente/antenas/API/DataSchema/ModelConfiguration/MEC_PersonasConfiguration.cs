using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_PersonasConfiguration : IEntityTypeConfiguration<MEC_Personas>
    {
        public void Configure(EntityTypeBuilder<MEC_Personas> builder)
        {
            builder
                .HasKey(k => k.IdPersona);

            builder
                .Property(p => p.IdPersona)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.DNI)
                .HasColumnType("char(8)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Apellido)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.Nombre)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.Legajo)
                .HasColumnType("varchar(10)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

        }
    }
}
