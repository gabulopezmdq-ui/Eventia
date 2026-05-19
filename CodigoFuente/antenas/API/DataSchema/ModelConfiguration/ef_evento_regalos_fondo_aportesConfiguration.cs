using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_regalos_fondo_aportesConfiguration : IEntityTypeConfiguration<ef_evento_regalos_fondo_aportes>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_fondo_aportes> builder)
        {
            builder.ToTable("ef_evento_regalos_fondo_aportes");

            builder.HasKey(x => x.id_aporte);
            builder.Property(x => x.id_aporte).ValueGeneratedOnAdd();

            builder.Property(x => x.rsvp_token).HasMaxLength(64);
            builder.Property(x => x.nombre_mostrado).HasMaxLength(120);

            builder.Property(x => x.es_anonimo).HasDefaultValue(false).IsRequired();

            builder.Property(x => x.monto_aporte).HasColumnType("numeric(12,2)");
            builder.Property(x => x.moneda_aporte).HasMaxLength(3);

            builder.Property(x => x.monto_base_calculado).HasColumnType("numeric(12,2)");
            builder.Property(x => x.tipo_cambio_usado).HasColumnType("numeric(18,6)");

            builder.Property(x => x.estado).HasMaxLength(25).HasDefaultValue("DECLARADO").IsRequired();

            builder.Property(x => x.mensaje).HasMaxLength(300);
            builder.Property(x => x.mostrar_en_muro).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.comprobante_url).HasMaxLength(700);

            builder.Property(x => x.fecha_declara).IsRequired();
            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();

            builder.HasIndex(x => new { x.id_meta, x.estado }).HasDatabaseName("ix_ef_evento_regalos_fondo_aportes_meta_estado");
            builder.HasIndex(x => new { x.id_evento, x.fecha_declara }).HasDatabaseName("ix_ef_evento_regalos_fondo_aportes_evento_fecha");
            builder.HasIndex(x => new { x.id_fondo, x.estado }).HasDatabaseName("ix_ef_evento_regalos_fondo_aportes_fondo_estado");

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_evento_regalos_fondos)
                   .WithMany()
                   .HasForeignKey(x => x.id_fondo)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_evento_regalos_fondo_metas)
                   .WithMany()
                   .HasForeignKey(x => x.id_meta)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_invitados)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.ef_usuarios)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_confirma)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}