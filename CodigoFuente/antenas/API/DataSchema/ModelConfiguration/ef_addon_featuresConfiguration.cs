using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_addon_featuresConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_addon_features>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_addon_features> builder)
        {
            builder.ToTable("ef_addon_features", "public");

            builder.HasKey(x => x.id_addon_feature);

            builder.Property(x => x.id_addon_feature)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_addon)
                   .IsRequired();

            builder.Property(x => x.id_feature)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.config_json_override)
                   .HasColumnType("jsonb");

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasIndex(x => new { x.id_addon, x.id_feature })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_addon_features_addon_feature");

            builder.HasIndex(x => x.id_addon)
                   .HasDatabaseName("ix_ef_addon_features_addon");

            builder.HasIndex(x => x.id_feature)
                   .HasDatabaseName("ix_ef_addon_features_feature");
        }
    }
}
