using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_featuresConfiguration : IEntityTypeConfiguration<ef_evento_features>
    {
        public void Configure(EntityTypeBuilder<ef_evento_features> builder)
        {
            builder.ToTable("ef_evento_features");

            builder.HasKey(x => x.id_evento_feature);

            builder.Property(x => x.id_evento_feature).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_feature).IsRequired();

            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.config_json).HasColumnType("jsonb");

            builder.HasIndex(x => new { x.id_evento, x.id_feature })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_features_evento_feature");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_features_activo_true")
                   .HasFilter("activo = true");
        }
    }
}
