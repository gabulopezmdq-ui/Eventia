using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_param_tipos_novedad_eventoConfiguration : IEntityTypeConfiguration<ef_param_tipos_novedad_evento>
    {
        public void Configure(EntityTypeBuilder<ef_param_tipos_novedad_evento> builder)
        {
            builder.ToTable("ef_param_tipos_novedad_evento");

            builder.HasKey(x => x.id_tipo_novedad_evento);

            builder.Property(x => x.id_tipo_novedad_evento)
                .HasColumnName("id_tipo_novedad_evento");

            builder.Property(x => x.codigo)
                .HasColumnName("codigo")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_param_tipos_novedad_evento_codigo");
        }
    }
}