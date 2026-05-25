using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_transporte_pro_configConfiguration : IEntityTypeConfiguration<ef_evento_transporte_pro_config>
    {
        public void Configure(EntityTypeBuilder<ef_evento_transporte_pro_config> builder)
        {
            builder.ToTable("ef_evento_transporte_pro_config", "public");

            builder.HasKey(x => x.id_evento)
                   .HasName("pk_ef_evento_transporte_pro_config");

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.pro_habilitado).HasDefaultValue(false).IsRequired();
            builder.Property(x => x.requiere_pago).HasDefaultValue(false).IsRequired();

            builder.Property(x => x.max_plazas_por_reserva).HasDefaultValue(4).IsRequired();
            builder.Property(x => x.permitir_reservar_ida).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.permitir_reservar_vuelta).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.vencimiento_minutos_pago);

            builder.Property(x => x.pago_titular_cuenta).HasMaxLength(120);
            builder.Property(x => x.pago_cbu_alias).HasMaxLength(120);
            builder.Property(x => x.pago_banco).HasMaxLength(120);
            builder.Property(x => x.pago_instrucciones).HasMaxLength(500);

            builder.Property(x => x.fecha_alta).IsRequired();
            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_transporte_pro_config_evento");
        }
    }
}