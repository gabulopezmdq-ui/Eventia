using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_qr_scansConfiguration : IEntityTypeConfiguration<ef_qr_scans>
    {
        public void Configure(EntityTypeBuilder<ef_qr_scans> builder)
        {
            builder.ToTable("ef_qr_scans", "public");

            builder.HasKey(x => x.id_qr_scan)
                .HasName("ef_qr_scans_pkey");

            builder.Property(x => x.id_qr_scan)
                .HasColumnName("id_qr_scan")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento");

            builder.Property(x => x.qr_token)
                .HasColumnName("qr_token")
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(x => x.id_invitado)
                .HasColumnName("id_invitado");

            builder.Property(x => x.resultado)
                .HasColumnName("resultado")
                .HasColumnType("char(1)")
                .IsRequired();

            builder.Property(x => x.mensaje)
                .HasColumnName("mensaje")
                .HasMaxLength(200);

            builder.Property(x => x.fecha_scan)
                .HasColumnName("fecha_scan")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.id_usuario_operador)
                .HasColumnName("id_usuario_operador");

            builder.Property(x => x.device_id)
                .HasColumnName("device_id")
                .HasMaxLength(80);

            builder.Property(x => x.ip)
                .HasColumnName("ip")
                .HasMaxLength(60);

            builder.Property(x => x.user_agent)
                .HasColumnName("user_agent")
                .HasMaxLength(200);

            // Índices
            builder.HasIndex(x => new { x.id_evento, x.fecha_scan })
                .HasDatabaseName("ix_qr_scans_evento_fecha");

            builder.HasIndex(x => x.qr_token)
                .HasDatabaseName("ix_qr_scans_qr");

            // Foreign Keys
            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .HasConstraintName("fk_qr_scans_evento");

            builder.HasOne(x => x.invitado)
                .WithMany()
                .HasForeignKey(x => x.id_invitado)
                .HasConstraintName("fk_qr_scans_invitado");

            builder.HasOne(x => x.usuario_operador)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_operador)
                .HasConstraintName("fk_qr_scans_usuario");

            // Check
            builder.HasCheckConstraint(
                "ck_qr_scans_resultado",
                "resultado in ('O','N','E')");
        }
    }
}
