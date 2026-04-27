using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_servicios_baseConfiguration : IEntityTypeConfiguration<ef_param_programa_servicios_base>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_servicios_base> builder)
        {
            builder.ToTable("ef_param_programa_servicios_base", "public");

            builder.HasKey(x => x.id_servicio_base);

            builder.Property(x => x.id_servicio_base)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(50)
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
                   .HasDatabaseName("ux_ef_param_programa_servicios_base_codigo");
        }
    }
}