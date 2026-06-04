using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_historialConfiguration : IEntityTypeConfiguration<ef_evento_historial>
    {
        public void Configure(EntityTypeBuilder<ef_evento_historial> builder)
        {
            builder.ToTable("ef_evento_historial");

            builder.HasKey(x => x.id_historial);

            builder.Property(x => x.id_historial)
                .HasColumnName("id_historial");

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.modulo)
                .HasColumnName("modulo")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.accion)
                .HasColumnName("accion")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.entidad)
                .HasColumnName("entidad")
                .HasMaxLength(80);

            builder.Property(x => x.id_entidad)
                .HasColumnName("id_entidad");

            builder.Property(x => x.descripcion)
                .HasColumnName("descripcion")
                .IsRequired();

            builder.Property(x => x.id_usuario)
                .HasColumnName("id_usuario");

            builder.Property(x => x.usuario_snapshot)
                .HasColumnName("usuario_snapshot")
                .HasMaxLength(200);

            builder.Property(x => x.fecha)
                .HasColumnName("fecha")
                .IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.fecha })
                .HasDatabaseName("ix_ef_evento_historial_evento_fecha");

            builder.HasIndex(x => new { x.id_evento, x.modulo, x.fecha })
                .HasDatabaseName("ix_ef_evento_historial_modulo");

            builder.HasIndex(x => new { x.entidad, x.id_entidad })
                .HasDatabaseName("ix_ef_evento_historial_entidad");
        }
    }
}