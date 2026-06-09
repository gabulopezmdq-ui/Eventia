using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_plan_cambiosConfiguration : IEntityTypeConfiguration<ef_cuenta_plan_cambios>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_plan_cambios> builder)
        {
            builder.ToTable("ef_cuenta_plan_cambios");

            builder.HasKey(x => x.id_cuenta_plan_cambio);

            builder.Property(x => x.id_cuenta_plan_cambio).ValueGeneratedOnAdd();

            builder.Property(x => x.estado).HasMaxLength(20).IsRequired();

            builder.Property(x => x.codigo_mercado).HasMaxLength(20).IsRequired();
            builder.Property(x => x.codigo_moneda).HasMaxLength(3).IsRequired();

            builder.Property(x => x.precio_plan_actual_reconocido).HasColumnType("numeric(12,2)");
            builder.Property(x => x.precio_plan_solicitado_lista).HasColumnType("numeric(12,2)");
            builder.Property(x => x.precio_plan_solicitado_publicado).HasColumnType("numeric(12,2)");
            builder.Property(x => x.diferencia_base).HasColumnType("numeric(12,2)");
            builder.Property(x => x.importe_ajuste).HasColumnType("numeric(12,2)");
            builder.Property(x => x.total_a_cobrar).HasColumnType("numeric(12,2)");

            builder.Property(x => x.tipo_ajuste).HasMaxLength(30);
            builder.Property(x => x.motivo_ajuste).HasMaxLength(200);
            builder.Property(x => x.descripcion_ajuste).HasMaxLength(500);
            builder.Property(x => x.motivo_solicitud).HasMaxLength(500);
            builder.Property(x => x.observacion_admin).HasMaxLength(500);

            builder.Property(x => x.activo).HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired();
            builder.Property(x => x.fecha_solicitud).IsRequired();

            builder.HasIndex(x => new { x.id_cuenta, x.estado });
            builder.HasIndex(x => new { x.estado, x.fecha_solicitud });

            builder.HasOne<ef_cuentas>()
                .WithMany()
                .HasForeignKey(x => x.id_cuenta)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_planes>()
                .WithMany()
                .HasForeignKey(x => x.id_plan_actual)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_planes>()
                .WithMany()
                .HasForeignKey(x => x.id_plan_solicitado)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_usuarios>()
                .WithMany()
                .HasForeignKey(x => x.id_usuario_solicita)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_usuarios>()
                .WithMany()
                .HasForeignKey(x => x.id_usuario_admin)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}