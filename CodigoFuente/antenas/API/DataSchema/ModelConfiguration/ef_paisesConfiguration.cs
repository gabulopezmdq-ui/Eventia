using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_paisesConfiguration : IEntityTypeConfiguration<ef_paises>
    {
        public void Configure(EntityTypeBuilder<ef_paises> builder)
        {
            builder.ToTable("ef_paises", "public");

            builder.HasKey(x => x.id_pais);

            builder.Property(x => x.id_pais)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo_iso2)
                   .HasMaxLength(2)
                   .IsRequired();

            builder.Property(x => x.codigo_iso3)
                   .HasMaxLength(3)
                   .IsRequired(false);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue((short)0);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo_iso2)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_paises_codigo_iso2");

            builder.HasIndex(x => x.codigo_iso3)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_paises_codigo_iso3");
        }
    }
}