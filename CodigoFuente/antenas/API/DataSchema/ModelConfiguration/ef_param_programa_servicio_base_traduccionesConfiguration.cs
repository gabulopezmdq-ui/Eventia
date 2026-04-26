using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_programa_servicio_base_traduccionesConfiguration : IEntityTypeConfiguration<ef_param_programa_servicio_base_traducciones>
    {
        public void Configure(EntityTypeBuilder<ef_param_programa_servicio_base_traducciones> builder)
        {
            builder.ToTable("ef_param_programa_servicio_base_traducciones", "public");

            builder.HasKey(x => x.id_servicio_base_traduccion);

            builder.Property(x => x.id_servicio_base_traduccion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_servicio_base)
                   .IsRequired();

            builder.Property(x => x.id_idioma)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.descripcion)
                   .HasMaxLength(300);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_servicio_base, x.id_idioma })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_programa_serv_base_trad_servicio_idioma");

            builder.HasOne(x => x.servicio_base)
                   .WithMany()
                   .HasForeignKey(x => x.id_servicio_base)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}