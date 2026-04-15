using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_tipos_beneficio_registroConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_tipos_beneficio_registro>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_tipos_beneficio_registro> builder)
        {
            builder.ToTable("ef_param_tipos_beneficio_registro", "public");

            builder.HasKey(x => x.id_tipo_beneficio_registro);

            builder.Property(x => x.id_tipo_beneficio_registro)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(40)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_tipos_beneficio_registro_codigo");

            builder.HasIndex(x => new { x.activo, x.orden })
                   .HasDatabaseName("ix_ef_param_tipos_beneficio_registro_activo_orden");

            builder.HasCheckConstraint(
                "ck_ef_param_tipos_beneficio_registro_orden",
                "orden >= 1"
            );
        }
    }
}