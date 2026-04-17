using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_perfiles_asistenciaConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_perfiles_asistencia>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_perfiles_asistencia> builder)
        {
            builder.ToTable("ef_param_perfiles_asistencia", "public");

            builder.HasKey(x => x.id_perfil_asistencia);

            builder.Property(x => x.id_perfil_asistencia)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo).IsRequired().HasMaxLength(80);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue(0);
        }
    }
}