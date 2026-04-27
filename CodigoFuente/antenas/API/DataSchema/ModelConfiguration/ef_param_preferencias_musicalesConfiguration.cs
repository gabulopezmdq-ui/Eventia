using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_preferencias_musicalesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_preferencias_musicales>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_preferencias_musicales> builder)
        {
            builder.ToTable("ef_param_preferencias_musicales", "public");

            builder.HasKey(x => x.id_preferencia_musical);

            builder.Property(x => x.id_preferencia_musical)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo).IsRequired().HasMaxLength(80);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue(0);
        }
    }
}