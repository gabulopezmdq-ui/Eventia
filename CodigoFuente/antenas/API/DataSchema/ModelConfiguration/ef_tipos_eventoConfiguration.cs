using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_tipos_eventoConfiguration : IEntityTypeConfiguration<ef_tipos_evento>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_tipos_evento> builder)
        {
            builder.ToTable("ef_tipos_evento");
              
            builder.HasKey(x => x.id_tipo_evento);

            builder.Property(x => x.id_tipo_evento)
                   .ValueGeneratedOnAdd();
              
            builder.Property(x => x.codigo)
                    .HasMaxLength(100);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.tipo_operacion)
                   .HasMaxLength(20)
                   .IsRequired()
                   .HasDefaultValue("EVENTO")
                   .IsUnicode(false);

            builder.HasIndex(x => x.tipo_operacion)
                   .HasDatabaseName("ix_ef_tipos_evento_tipo_operacion");

            builder.HasCheckConstraint(
                "ck_ef_tipos_evento_tipo_operacion",
                "tipo_operacion in ('EVENTO', 'PROGRAMA')"
            );

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_tipos_evento_codigo");
        }
    }
}
