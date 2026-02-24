using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_feature_dependenciasConfiguration : IEntityTypeConfiguration<ef_param_feature_dependencias>
    {
        public void Configure(EntityTypeBuilder<ef_param_feature_dependencias> builder)
        {
            builder.ToTable("ef_param_feature_dependencias");

            builder.HasKey(x => new { x.id_feature, x.id_feature_requiere });

            builder.Property(x => x.id_feature).IsRequired();
            builder.Property(x => x.id_feature_requiere).IsRequired();

            builder.HasIndex(x => x.id_feature_requiere)
                   .HasDatabaseName("ix_ef_param_feature_dep_requiere");
        }
    }
}
