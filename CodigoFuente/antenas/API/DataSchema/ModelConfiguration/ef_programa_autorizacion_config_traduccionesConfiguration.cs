using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_autorizacion_config_traduccionesConfiguration : IEntityTypeConfiguration<ef_programa_autorizacion_config_traducciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_autorizacion_config_traducciones> builder)
        {
            builder.ToTable("ef_programa_autorizacion_config_traducciones", "public");

            builder.HasKey(x => x.id_programa_autorizacion_config_traduccion);

            builder.Property(x => x.id_programa_autorizacion_config_traduccion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_programa_autorizacion_config)
                   .IsRequired();

            builder.Property(x => x.id_idioma)
                   .IsRequired();

            builder.Property(x => x.titulo)
                   .HasMaxLength(160)
                   .IsRequired();

            builder.Property(x => x.texto)
                   .HasMaxLength(1200);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_programa_autorizacion_config, x.id_idioma })
                   .IsUnique()
                   .HasDatabaseName("ux_prog_aut_config_trad_config_idioma");

            builder.HasOne(x => x.autorizacion_config)
                   .WithMany()
                   .HasForeignKey(x => x.id_programa_autorizacion_config)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}