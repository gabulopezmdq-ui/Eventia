using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_scope_addonsConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_scope_addons>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_scope_addons> builder)
        {
            builder.ToTable("ef_scope_addons", "public");

            builder.HasKey(x => x.id_scope_addon);

            builder.Property(x => x.id_scope_addon)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.scope)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(15)
                   .HasDefaultValue("ACTIVO")
                   .IsRequired();

            builder.Property(x => x.id_addon)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.config_json_override)
                   .HasColumnType("jsonb");

            builder.Property(x => x.fecha_desde)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            // Índices como en el DDL
            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_scope_addons_evento");

            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_ef_scope_addons_cuenta");

            builder.HasIndex(x => x.id_addon)
                   .HasDatabaseName("ix_ef_scope_addons_addon");
        }
    }
}
