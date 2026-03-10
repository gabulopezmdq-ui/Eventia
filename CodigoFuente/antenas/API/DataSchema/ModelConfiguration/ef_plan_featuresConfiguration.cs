using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plan_featuresConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_plan_features>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_plan_features> builder)
        {
            builder.ToTable("ef_plan_features", "public");

            builder.HasKey(x => x.id_plan_feature);

            builder.Property(x => x.id_plan_feature)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_plan)
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

            builder.HasIndex(x => new { x.id_plan, x.id_feature })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_plan_features_plan_feature");

            builder.HasIndex(x => x.id_plan)
                   .HasDatabaseName("ix_ef_plan_features_plan");

            builder.HasIndex(x => x.id_feature)
                   .HasDatabaseName("ix_ef_plan_features_feature");
        }
    }
}
