using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_edad_rangosConfiguration : IEntityTypeConfiguration<ef_evento_edad_rangos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_evento_edad_rangos> builder)
        {
            builder.ToTable("ef_evento_edad_rangos", "public");

            builder.HasKey(x => x.id_evento_edad_rango)
                .HasName("ef_evento_edad_rangos_pkey");

            builder.Property(x => x.id_evento_edad_rango)
                .HasColumnName("id_evento_edad_rango")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_edad_rango)
                .HasColumnName("id_edad_rango")
                .IsRequired();

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
            builder.HasIndex(x => new { x.id_evento, x.codigo })
                .IsUnique()
                .HasDatabaseName("ux_eer_evento_codigo");

            builder.HasIndex(x => x.id_evento)
                .HasDatabaseName("ix_eer_evento");

            // FKs
            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .HasConstraintName("fk_eer_evento");

            builder.HasOne(x => x.edad_rango_param)
                .WithMany()
                .HasForeignKey(x => x.id_edad_rango)
                .HasConstraintName("fk_eer_param");

            // Checks
            builder.HasCheckConstraint(
                "ck_eer_max",
                "edad_max IS NULL OR edad_max >= edad_min");

            builder.HasCheckConstraint(
                "ck_eer_min",
                "edad_min >= 0");

            builder.HasCheckConstraint(
                "ck_eer_cat",
                "categoria_base in ('A','N','B')");
        }
    }
}
