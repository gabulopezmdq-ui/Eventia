using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_pagosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_pagos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_pagos> builder)
        {
            builder.ToTable("ef_pagos", "public");

            builder.HasKey(x => x.id_pago);

            builder.Property(x => x.id_pago)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.tipo)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(20)
                   .HasDefaultValue("CREADO")
                   .IsRequired();

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.concepto)
                   .HasMaxLength(200);

            builder.Property(x => x.snapshot_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.idempotency_key)
                   .HasMaxLength(80);

            builder.Property(x => x.external_provider)
                   .HasMaxLength(30);

            builder.Property(x => x.external_payment_id)
                   .HasMaxLength(100);

            builder.Property(x => x.external_status)
                   .HasMaxLength(50);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.impuestos)
                   .HasDefaultValue(0);

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasIndex(x => x.id_suscripcion)
                   .HasDatabaseName("ix_ef_pagos_suscripcion");

            builder.HasIndex(x => x.idempotency_key)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_pagos_idempotency_key");
        }
    }
}
