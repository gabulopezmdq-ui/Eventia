using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_webhook_eventosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_webhook_eventos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_webhook_eventos> builder)
        {
            builder.ToTable("ef_webhook_eventos", "public");

            builder.HasKey(x => x.id_webhook);

            builder.Property(x => x.id_webhook)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.external_provider)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.external_event_id)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.tipo_evento)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.raw_payload)
                   .HasColumnType("jsonb");

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasIndex(x => new { x.external_provider, x.external_event_id })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_webhook_eventos_provider_event");
        }
    }
}