using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_tipos_calculoConfiguration : IEntityTypeConfiguration<ef_param_programa_tipos_calculo>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_tipos_calculo> builder)
        {
            builder.ToTable("ef_param_programa_tipos_calculo", "public");

            builder.HasKey(x => x.id_tipo_calculo);

            builder.Property(x => x.id_tipo_calculo)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(40)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_programa_tipos_calculo_codigo");
        }
    }
}