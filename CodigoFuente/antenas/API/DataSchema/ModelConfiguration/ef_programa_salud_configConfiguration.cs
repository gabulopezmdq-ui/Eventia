using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_salud_configConfiguration : IEntityTypeConfiguration<ef_programa_salud_config>
    {
        public void Configure(EntityTypeBuilder<ef_programa_salud_config> builder)
        {
            builder.ToTable("ef_programa_salud_config", "public");

            builder.HasKey(x => x.id_salud_config);

            builder.Property(x => x.id_salud_config)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.pedir_problema_medico).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.problema_medico_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.pedir_alergias_no_alimentarias).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.alergias_no_alimentarias_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.pedir_necesidad_especial).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.necesidad_especial_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.pedir_cobertura_medica).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.cobertura_medica_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.pedir_contacto_emergencia).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.contacto_emergencia_obligatorio).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.pedir_autoriza_emergencia_medica).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.autoriza_emergencia_medica_obligatorio).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.pedir_observaciones_familia).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.observaciones_familia_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.pedir_medicaciones).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.medicaciones_obligatorio).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento)
                   .IsUnique()
                   .HasDatabaseName("ux_programa_salud_config_evento");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}