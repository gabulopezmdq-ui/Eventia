using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_plan_cambiosConfiguration : IEntityTypeConfiguration<ef_evento_plan_cambios>
    {
        public void Configure(EntityTypeBuilder<ef_evento_plan_cambios> builder)
        {
            builder.ToTable("ef_evento_plan_cambios");

            builder.HasKey(x => x.id_evento_plan_cambio);

            builder.Property(x => x.id_evento_plan_cambio)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.id_plan_actual)
                   .IsRequired();

            builder.Property(x => x.id_plan_solicitado)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(20)
                   .HasDefaultValue("PENDIENTE")
                   .IsRequired();

            builder.Property(x => x.codigo_mercado)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.codigo_moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.precio_plan_actual_reconocido)
                   .HasColumnType("numeric(12,2)")
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.precio_plan_solicitado_lista)
                   .HasColumnType("numeric(12,2)")
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.precio_plan_solicitado_publicado)
                   .HasColumnType("numeric(12,2)")
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.diferencia_base)
                   .HasColumnType("numeric(12,2)")
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.tipo_ajuste)
                   .HasMaxLength(20);

            builder.Property(x => x.importe_ajuste)
                   .HasColumnType("numeric(12,2)");

            builder.Property(x => x.motivo_ajuste)
                   .HasMaxLength(100);

            builder.Property(x => x.descripcion_ajuste)
                   .HasMaxLength(500);

            builder.Property(x => x.total_a_cobrar)
                   .HasColumnType("numeric(12,2)")
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.motivo_solicitud)
                   .HasMaxLength(500);

            builder.Property(x => x.observacion_admin)
                   .HasMaxLength(500);

            builder.Property(x => x.fecha_solicitud)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            builder.HasOne<ef_eventos>()
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<ef_planes>()
                   .WithMany()
                   .HasForeignKey(x => x.id_plan_actual)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_planes>()
                   .WithMany()
                   .HasForeignKey(x => x.id_plan_solicitado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_mercados>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_mercado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_monedas>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_moneda)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_usuarios>()
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_solicita)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_usuarios>()
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_admin)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.id_evento, x.estado });

            builder.HasIndex(x => new { x.estado, x.fecha_solicitud });

            builder.HasIndex(x => new { x.id_usuario_solicita, x.fecha_solicitud });

            builder.HasIndex(x => x.id_evento)
                   .IsUnique()
                   .HasFilter("estado = 'PENDIENTE'");
        }
    }
}