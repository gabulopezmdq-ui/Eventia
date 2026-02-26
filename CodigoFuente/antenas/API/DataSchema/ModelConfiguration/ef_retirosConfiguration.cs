using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_retirosConfiguration : IEntityTypeConfiguration<ef_retiros>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_retiros> builder)
        {
            builder.ToTable("ef_retiros", "public");

            builder.HasKey(x => x.id_retiro)
                .HasName("ef_retiros_pkey");

            builder.Property(x => x.id_retiro)
                .HasColumnName("id_retiro")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_invitado_nino)
                .HasColumnName("id_invitado_nino")
                .IsRequired();

            builder.Property(x => x.id_autorizacion)
                .HasColumnName("id_autorizacion");

            builder.Property(x => x.nombre_retirador)
                .HasColumnName("nombre_retirador")
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.celular_retirador)
                .HasColumnName("celular_retirador")
                .HasMaxLength(40);

            builder.Property(x => x.metodo_validacion)
                .HasColumnName("metodo_validacion")
                .HasColumnType("char(1)")
                .IsRequired();

            builder.Property(x => x.observaciones)
                .HasColumnName("observaciones")
                .HasMaxLength(200);

            builder.Property(x => x.fecha_retiro)
                .HasColumnName("fecha_retiro")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.id_usuario_operador)
                .HasColumnName("id_usuario_operador");

            // Índices
            builder.HasIndex(x => new { x.id_evento, x.fecha_retiro })
                .HasDatabaseName("ix_retiros_evento_fecha");

            builder.HasIndex(x => x.id_invitado_nino)
                .HasDatabaseName("ix_retiros_nino_fecha");

            // Foreign Keys
            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .HasConstraintName("fk_retiros_evento");

            builder.HasOne(x => x.invitado_nino)
                .WithMany()
                .HasForeignKey(x => x.id_invitado_nino)
                .HasConstraintName("fk_retiros_nino");

            builder.HasOne(x => x.autorizacion)
                .WithMany()
                .HasForeignKey(x => x.id_autorizacion)
                .HasConstraintName("fk_retiros_aut");

            builder.HasOne(x => x.usuario_operador)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_operador)
                .HasConstraintName("fk_retiros_usuario");

            // Check
            builder.HasCheckConstraint(
                "ck_retiros_metodo",
                "metodo_validacion in ('A','M','O')");
        }
    }
}
