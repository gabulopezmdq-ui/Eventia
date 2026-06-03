using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_agendaConfiguration : IEntityTypeConfiguration<ef_evento_agenda>
    {
        public void Configure(EntityTypeBuilder<ef_evento_agenda> builder)
        {
            builder.ToTable("ef_evento_agenda");

            builder.HasKey(x => x.id_agenda);

            builder.Property(x => x.id_agenda).HasColumnName("id_agenda");
            builder.Property(x => x.id_evento).HasColumnName("id_evento").IsRequired();
            builder.Property(x => x.id_tramo).HasColumnName("id_tramo");
            builder.Property(x => x.id_tipo_agenda_evento).HasColumnName("id_tipo_agenda_evento").IsRequired();

            builder.Property(x => x.titulo)
                .HasColumnName("titulo")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.descripcion).HasColumnName("descripcion");

            builder.Property(x => x.dia_semana).HasColumnName("dia_semana");
            builder.Property(x => x.fecha).HasColumnName("fecha");

            builder.Property(x => x.hora_inicio).HasColumnName("hora_inicio");
            builder.Property(x => x.hora_fin).HasColumnName("hora_fin");

            builder.Property(x => x.orden).HasColumnName("orden").IsRequired();
            builder.Property(x => x.visible_publico).HasColumnName("visible_publico").IsRequired();
            builder.Property(x => x.activo).HasColumnName("activo").IsRequired();

            builder.Property(x => x.fecha_alta).HasColumnName("fecha_alta").IsRequired();
            builder.Property(x => x.fecha_modif).HasColumnName("fecha_modif");

            builder.HasIndex(x => new { x.id_evento, x.id_tipo_agenda_evento, x.activo })
                .HasDatabaseName("ix_ef_evento_agenda_evento_tipo");

            builder.HasIndex(x => new { x.id_evento, x.fecha })
                .HasDatabaseName("ix_ef_evento_agenda_evento_fecha");

            builder.HasIndex(x => new { x.id_evento, x.dia_semana })
                .HasDatabaseName("ix_ef_evento_agenda_evento_dia");
        }
    }
}