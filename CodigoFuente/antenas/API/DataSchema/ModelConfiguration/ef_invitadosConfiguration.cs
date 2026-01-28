using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitadosConfiguration : IEntityTypeConfiguration<ef_invitados>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_invitados> builder)
        {
            builder.ToTable("ef_invitados", "public");

            builder.HasKey(x => x.id_invitado);

            builder.Property(x => x.id_invitado)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.apellido)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.sobrenombre)
                   .HasMaxLength(60);

            builder.Property(x => x.email)
                   .HasMaxLength(200);

            builder.Property(x => x.celular)
                   .HasMaxLength(50);

            builder.Property(x => x.rsvp_token)
                   .HasMaxLength(64)
                   .IsRequired();

            builder.Property(x => x.rsvp_estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .HasDefaultValue("P")
                   .IsUnicode(false);

            builder.Property(x => x.rsvp_mensaje)
                   .HasMaxLength(300);

            builder.Property(x => x.fecha_rsvp);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.qr_token)
                   .HasMaxLength(64);

            builder.HasIndex(x => x.qr_token)
                .IsUnique();

            builder.HasOne(x => x.usuario_invitador)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_invitador);

            // CHECKs (igual que en BD)
            builder.HasCheckConstraint(
                "ck_ef_invitados_rsvp_estado",
                "rsvp_estado in ('P','Y','N')"
            );

            builder.HasCheckConstraint(
                "ck_ef_invitados_rsvp_mensaje_len",
                "(rsvp_mensaje is null) or (length(rsvp_mensaje) <= 300)"
            );

            // Índices
            builder.HasIndex(x => x.rsvp_token)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_invitados_rsvp_token");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_invitados_id_evento");

            builder.HasIndex(x => new { x.id_evento, x.rsvp_estado })
                   .HasDatabaseName("ix_ef_invitados_evento_estado");

            builder.HasIndex(x => x.id_invitado)
                   .HasDatabaseName("ix_ef_invitados_activo_true")
                   .HasFilter("activo = true");

            // FK
            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
