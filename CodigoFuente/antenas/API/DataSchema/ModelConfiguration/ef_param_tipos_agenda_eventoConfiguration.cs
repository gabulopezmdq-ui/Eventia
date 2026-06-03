using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_param_tipos_agenda_eventoConfiguration : IEntityTypeConfiguration<ef_param_tipos_agenda_evento>
    {
        public void Configure(EntityTypeBuilder<ef_param_tipos_agenda_evento> builder)
        {
            builder.ToTable("ef_param_tipos_agenda_evento");

            builder.HasKey(x => x.id_tipo_agenda_evento);

            builder.Property(x => x.id_tipo_agenda_evento)
                .HasColumnName("id_tipo_agenda_evento");

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
                .HasDatabaseName("ux_ef_param_tipos_agenda_evento_codigo");
        }
    }
}