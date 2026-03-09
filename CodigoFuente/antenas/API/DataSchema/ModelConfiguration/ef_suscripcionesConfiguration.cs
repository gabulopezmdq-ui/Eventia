using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_suscripcionesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_suscripciones>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_suscripciones> builder)
        {
            builder.ToTable("ef_suscripciones", "public");

            builder.HasKey(x => x.id_suscripcion);

            builder.Property(x => x.id_suscripcion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.scope)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(20)
                   .HasDefaultValue("PENDIENTE")
                   .IsRequired();

            builder.Property(x => x.periodo)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.auto_renueva)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.cancel_at_period_end)
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(x => x.external_provider)
                   .HasMaxLength(30);

            builder.Property(x => x.external_subscription_id)
                   .HasMaxLength(100);

            builder.Property(x => x.external_customer_id)
                   .HasMaxLength(100);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.config_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_ef_suscripciones_cuenta");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_suscripciones_evento");
        }
    }
}