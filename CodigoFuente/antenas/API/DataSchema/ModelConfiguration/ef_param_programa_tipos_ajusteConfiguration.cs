using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_tipos_ajusteConfiguration : IEntityTypeConfiguration<ef_param_programa_tipos_ajuste>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_tipos_ajuste> builder)
        {
            builder.ToTable("ef_param_programa_tipos_ajuste", "public");

            builder.HasKey(x => x.id_tipo_ajuste);

            builder.Property(x => x.id_tipo_ajuste)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.orden)
                .IsRequired()
                .HasDefaultValue((short)1);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_param_prog_tipo_ajuste_codigo");
        }
    }
}