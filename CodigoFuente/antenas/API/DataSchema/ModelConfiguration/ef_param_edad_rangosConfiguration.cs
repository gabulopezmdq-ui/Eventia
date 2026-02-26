using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_edad_rangosConfiguration : IEntityTypeConfiguration<ef_param_edad_rangos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_edad_rangos> builder)
        {
            builder.ToTable("ef_param_edad_rangos", "public");

            builder.HasKey(x => x.id_edad_rango)
                .HasName("ef_param_edad_rangos_pkey");

            builder.Property(x => x.id_edad_rango)
                .HasColumnName("id_edad_rango")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasColumnName("codigo")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.nombre)
                .HasColumnName("nombre")
                .HasMaxLength(60)
                .IsRequired();

            builder.Property(x => x.categoria_base)
                .HasColumnName("categoria_base")
                .HasColumnType("char(1)")
                .IsRequired();

            builder.Property(x => x.edad_min)
                .HasColumnName("edad_min")
                .IsRequired();

            builder.Property(x => x.edad_max)
                .HasColumnName("edad_max");

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .HasDefaultValue(1)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .HasDefaultValue(true)
                .IsRequired();

            // Unique
            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_param_edad_rangos_codigo");

            // Check constraints
            builder.HasCheckConstraint(
                "ck_ef_param_edad_rangos_cat",
                "categoria_base in ('A','N','B')");

            builder.HasCheckConstraint(
                "ck_ef_param_edad_rangos_max",
                "edad_max IS NULL OR edad_max >= edad_min");

            builder.HasCheckConstraint(
                "ck_ef_param_edad_rangos_min",
                "edad_min >= 0");
        }
    }
}
