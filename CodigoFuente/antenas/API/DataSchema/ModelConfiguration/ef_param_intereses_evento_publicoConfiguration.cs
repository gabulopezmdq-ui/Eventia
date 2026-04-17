using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_intereses_evento_publicoConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_intereses_evento_publico>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_intereses_evento_publico> builder)
        {
            builder.ToTable("ef_param_intereses_evento_publico", "public");

            builder.HasKey(x => x.id_interes_evento_publico);

            builder.Property(x => x.id_interes_evento_publico)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo).IsRequired().HasMaxLength(80);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue(0);
        }
    }
}