using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_autorizacion_base_traduccionesConfiguration : IEntityTypeConfiguration<ef_param_programa_autorizacion_base_traducciones>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_autorizacion_base_traducciones> builder)
        {
            builder.ToTable("ef_param_programa_autorizacion_base_traducciones", "public");

            builder.HasKey(x => x.id_autorizacion_base_traduccion);

            builder.Property(x => x.id_autorizacion_base_traduccion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_autorizacion_base)
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

            builder.HasIndex(x => new { x.id_autorizacion_base, x.id_idioma })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_programa_aut_base_trad_base_idioma");

            builder.HasOne(x => x.autorizacion_base)
                   .WithMany()
                   .HasForeignKey(x => x.id_autorizacion_base)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}