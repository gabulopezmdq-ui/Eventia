using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_limitesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_limites>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_limites> builder)
        {
            builder.ToTable("ef_param_limites", "public");

            builder.HasKey(x => x.id_limite);

            builder.Property(x => x.id_limite)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo_limite)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.tipo_valor)
                   .HasMaxLength(10)
                   .IsRequired()
                   .HasDefaultValue("INT");

            builder.Property(x => x.scope)
                   .HasMaxLength(10)
                   .IsRequired()
                   .HasDefaultValue("EVENTO");

            builder.Property(x => x.mostrar_publico)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo_limite)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_limites_codigo");
        }
    }
}