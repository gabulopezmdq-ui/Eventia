using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_idiomasConfiguration : IEntityTypeConfiguration<ef_idiomas>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_idiomas> builder)
        {
            builder.ToTable("ef_idiomas");

            builder.HasKey(x => x.id_idioma);

            builder.Property(x => x.id_idioma)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo_idioma)
                   .HasMaxLength(5)
                   .IsRequired();

            builder.Property(x => x.codigo_region)
                   .HasMaxLength(5)
                   .IsRequired();

            builder.Property(x => x.locale)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.nombre_largo)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.bandera_iso2)
                   .HasMaxLength(2)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.locale)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_idiomas_locale");

            builder.HasIndex(x => x.id_idioma)
                   .HasDatabaseName("ix_ef_idiomas_activo_true")
                   .HasFilter("activo = true");
        }
    }
}
