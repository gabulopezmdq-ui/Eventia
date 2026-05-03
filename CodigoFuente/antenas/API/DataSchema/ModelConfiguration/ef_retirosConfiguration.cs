using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_retirosConfiguration : IEntityTypeConfiguration<ef_retiros>
    {
        public void Configure(EntityTypeBuilder<ef_retiros> builder)
        {
            builder.ToTable("ef_retiros", "public");

            builder.HasKey(x => x.id_retiro);

            builder.Property(x => x.id_retiro).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_invitado_nino).IsRequired();

            builder.Property(x => x.nombre_retirador)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.celular_retirador)
                .HasMaxLength(40);

            builder.Property(x => x.metodo_validacion)
                .HasMaxLength(1)
                .IsRequired();

            builder.Property(x => x.observaciones)
                .HasMaxLength(200);

            builder.Property(x => x.fecha_retiro)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_operativa)
                .IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.fecha_retiro })
                .HasDatabaseName("ix_retiros_evento_fecha");

            builder.HasIndex(x => new { x.id_invitado_nino, x.fecha_retiro })
                .HasDatabaseName("ix_retiros_nino_fecha");

            builder.HasIndex(x => new { x.id_evento, x.id_invitado_nino })
                .HasDatabaseName("ix_retiros_evento_nino");

            builder.HasIndex(x => new { x.id_evento, x.id_invitado_nino, x.fecha_operativa })
                .IsUnique()
                .HasDatabaseName("ux_retiros_unico_por_nino_dia");

            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.invitado_nino)
                .WithMany()
                .HasForeignKey(x => x.id_invitado_nino)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.autorizacion)
                .WithMany()
                .HasForeignKey(x => x.id_autorizacion)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario_operador)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_operador)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}