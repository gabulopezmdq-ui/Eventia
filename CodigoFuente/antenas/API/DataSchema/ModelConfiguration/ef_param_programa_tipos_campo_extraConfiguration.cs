using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_tipos_campo_extraConfiguration : IEntityTypeConfiguration<ef_param_programa_tipos_campo_extra>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_tipos_campo_extra> builder)
        {
            builder.ToTable("ef_param_programa_tipos_campo_extra", "public");

            builder.HasKey(x => x.id_tipo_campo_extra);

            builder.Property(x => x.id_tipo_campo_extra)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(30)
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

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_programa_tipos_campo_extra_codigo");
        }
    }
}