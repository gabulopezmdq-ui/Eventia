using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_autorizacionesConfiguration : IEntityTypeConfiguration<ef_autorizaciones>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_autorizaciones> builder)
        {
            builder.ToTable("ef_autorizaciones", "public");

            builder.HasKey(x => x.id_autorizacion);

            builder.Property(x => x.tipo)
                .HasColumnType("character(1)")
                .IsRequired();

            builder.Property(x => x.nombre_autorizado)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.telefono_autorizado).HasMaxLength(40);
            builder.HasOne(x => x.relacion_persona)
                .WithMany()
                .HasForeignKey(x => x.id_relacion_persona);
            builder.Property(x => x.observaciones).HasMaxLength(200);

            builder.Property(x => x.activo).IsRequired();
            builder.Property(x => x.fecha_alta).IsRequired();
            
            builder.Property(x => x.qr_token)
                    .HasMaxLength(64);

            builder.HasIndex(x => x.qr_token)
                   .HasDatabaseName("ix_ef_autorizaciones_qr_token");

            builder.HasOne(x => x.evento)
                .WithMany() // si no tenés navigation en ef_eventos
                .HasForeignKey(x => x.id_evento);

            builder.HasOne(x => x.invitado_objetivo)
                .WithMany() // si no tenés navigation en ef_invitados
                .HasForeignKey(x => x.id_invitado_objetivo);

            builder.HasIndex(x => new { x.id_evento, x.id_invitado_objetivo });
            builder.HasIndex(x => new { x.tipo, x.activo });

        }
    }
}
