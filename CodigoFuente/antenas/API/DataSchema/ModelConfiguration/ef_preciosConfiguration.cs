using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_preciosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_precios>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_precios> builder)
        {
            builder.ToTable("ef_precios", "public");

            builder.HasKey(x => x.id_precio);

            builder.Property(x => x.id_precio)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.objeto_tipo)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.mercado)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.impuestos_incluidos)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.tax_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.metadata_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.motivo)
                   .HasMaxLength(40);

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            // índices
            builder.HasIndex(x => new { x.id_plan, x.mercado, x.moneda, x.vigente_desde })
                   .HasDatabaseName("ix_ef_precios_plan");

            builder.HasIndex(x => new { x.id_addon, x.mercado, x.moneda, x.vigente_desde })
                   .HasDatabaseName("ix_ef_precios_addon");
        }
    }
}

