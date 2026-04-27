using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_periodosConfiguration : IEntityTypeConfiguration<ef_programa_periodos>
    {
        public void Configure(EntityTypeBuilder<ef_programa_periodos> builder)
        {
            builder.ToTable("ef_programa_periodos", "public");

            builder.HasKey(x => x.id_programa_periodo);

            builder.Property(x => x.id_programa_periodo)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.codigo)
                   .HasMaxLength(40)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.fecha_desde)
                   .IsRequired();

            builder.Property(x => x.fecha_hasta)
                   .IsRequired();

            builder.Property(x => x.precio_base)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired()
                   .HasDefaultValue("EUR")
                   .IsUnicode(false);

            builder.Property(x => x.cupo);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_programa_periodos_evento");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_ef_programa_periodos_evento_activo");

            builder.HasIndex(x => new { x.fecha_desde, x.fecha_hasta })
                   .HasDatabaseName("ix_ef_programa_periodos_fechas");

            builder.HasIndex(x => new { x.id_evento, x.codigo })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_programa_periodos_evento_codigo");

            builder.HasCheckConstraint(
                "ck_ef_programa_periodos_fechas",
                "fecha_hasta >= fecha_desde"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_periodos_precio",
                "precio_base >= 0"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_periodos_cupo",
                "cupo is null or cupo >= 0"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_periodos_moneda",
                "moneda in ('EUR', 'ARS', 'USD')"
            );

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}