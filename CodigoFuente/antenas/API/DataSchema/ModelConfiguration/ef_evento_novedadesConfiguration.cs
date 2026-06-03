using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_novedadesConfiguration : IEntityTypeConfiguration<ef_evento_novedades>
    {
        public void Configure(EntityTypeBuilder<ef_evento_novedades> builder)
        {
            builder.ToTable("ef_evento_novedades");

            builder.HasKey(x => x.id_novedad);

            builder.Property(x => x.id_novedad)
                .HasColumnName("id_novedad");

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_tipo_novedad_evento)
                .HasColumnName("id_tipo_novedad_evento")
                .IsRequired();

            builder.Property(x => x.titulo)
                .HasColumnName("titulo")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasColumnName("descripcion")
                .IsRequired();

            builder.Property(x => x.importante)
                .HasColumnName("importante")
                .IsRequired();

            builder.Property(x => x.visible_desde)
                .HasColumnName("visible_desde");

            builder.Property(x => x.visible_hasta)
                .HasColumnName("visible_hasta");

            builder.Property(x => x.publicado)
                .HasColumnName("publicado")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.id_usuario_alta)
                .HasColumnName("id_usuario_alta");

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.Property(x => x.url_adjunto)
                .HasColumnName("url_adjunto")
                .HasMaxLength(500);

            builder.Property(x => x.tipo_adjunto)
                .HasColumnName("tipo_adjunto")
                .HasMaxLength(20);

            builder.Property(x => x.destacada)
                .HasColumnName("destacada")
                .IsRequired();

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.activo, x.publicado })
                .HasDatabaseName("ix_ef_evento_novedades_evento");

            builder.HasIndex(x => x.id_tipo_novedad_evento)
                .HasDatabaseName("ix_ef_evento_novedades_tipo");

            builder.HasIndex(x => new { x.id_evento, x.visible_desde, x.visible_hasta })
                .HasDatabaseName("ix_ef_evento_novedades_visibilidad");

            builder.HasIndex(x => new { x.id_evento, x.destacada, x.importante, x.orden, x.fecha_alta })
                .HasDatabaseName("ix_ef_evento_novedades_orden");
        }
    }
}