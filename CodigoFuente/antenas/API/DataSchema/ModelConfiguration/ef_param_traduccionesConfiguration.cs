using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_traduccionesConfiguration : IEntityTypeConfiguration<ef_param_traducciones>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_traducciones> builder)
        {
            builder.ToTable("ef_param_traducciones");

            builder.HasKey(x => x.id_param_traduccion);

            builder.Property(x => x.entidad)
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.texto)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.fecha_alta)
                .HasDefaultValueSql("now()")
                .IsRequired();

            // Unique (entidad, id_item, id_idioma)
            builder.HasIndex(x => new { x.entidad, x.id_item, x.id_idioma })
                .IsUnique()
                .HasDatabaseName("ux_param_trad_entidad_item_idioma");

            builder.HasOne(x => x.idioma)
                .WithMany()
                .HasForeignKey(x => x.id_idioma)
                .HasConstraintName("fk_param_trad_idioma");
        }
    }
}
