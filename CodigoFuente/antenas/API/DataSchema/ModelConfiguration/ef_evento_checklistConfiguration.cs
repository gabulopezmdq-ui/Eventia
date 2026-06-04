using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_checklistConfiguration : IEntityTypeConfiguration<ef_evento_checklist>
    {
        public void Configure(EntityTypeBuilder<ef_evento_checklist> builder)
        {
            builder.ToTable("ef_evento_checklist");

            builder.HasKey(x => x.id_checklist);

            builder.Property(x => x.id_checklist)
                .HasColumnName("id_checklist");

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_checklist_prioridad)
                .HasColumnName("id_checklist_prioridad")
                .IsRequired();

            builder.Property(x => x.titulo)
                .HasColumnName("titulo")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasColumnName("descripcion");

            builder.Property(x => x.categoria)
                .HasColumnName("categoria")
                .HasMaxLength(80);

            builder.Property(x => x.fecha_limite)
                .HasColumnName("fecha_limite");

            builder.Property(x => x.completado)
                .HasColumnName("completado")
                .IsRequired();

            builder.Property(x => x.fecha_completado)
                .HasColumnName("fecha_completado");

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.id_usuario_alta)
                .HasColumnName("id_usuario_alta");

            builder.Property(x => x.id_usuario_completa)
                .HasColumnName("id_usuario_completa");

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.HasIndex(x => new { x.id_evento, x.activo, x.completado })
                .HasDatabaseName("ix_ef_evento_checklist_evento");

            builder.HasIndex(x => x.id_checklist_prioridad)
                .HasDatabaseName("ix_ef_evento_checklist_prioridad");

            builder.HasIndex(x => new { x.id_evento, x.completado, x.orden, x.fecha_limite })
                .HasDatabaseName("ix_ef_evento_checklist_orden");
        }
    }
}