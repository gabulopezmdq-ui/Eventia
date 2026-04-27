using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_serviciosConfiguration : IEntityTypeConfiguration<ef_programa_servicios>
    {
        public void Configure(EntityTypeBuilder<ef_programa_servicios> builder)
        {
            builder.ToTable("ef_programa_servicios", "public");

            builder.HasKey(x => x.id_programa_servicio);

            builder.Property(x => x.id_programa_servicio)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.codigo)
                   .HasMaxLength(40)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.descripcion)
                   .HasMaxLength(300);

            builder.Property(x => x.tipo_calculo)
                   .HasMaxLength(30)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.precio)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired()
                   .HasDefaultValue("EUR")
                   .IsUnicode(false);

            builder.Property(x => x.obligatorio)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.permite_cantidad)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.cupo);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(x => x.requiere_seleccion_dias)
                    .IsRequired()
                    .HasDefaultValue(false);

            builder.Property(x => x.config_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.id_servicio_base);

            builder.HasOne(x => x.servicio_base)
                   .WithMany()
                   .HasForeignKey(x => x.id_servicio_base)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_programa_servicios_evento");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_ef_programa_servicios_evento_activo");

            builder.HasIndex(x => new { x.id_evento, x.codigo })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_programa_servicios_evento_codigo");

            builder.HasCheckConstraint(
                "ck_ef_programa_servicios_precio",
                "precio >= 0"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_servicios_cupo",
                "cupo is null or cupo >= 0"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_servicios_moneda",
                "moneda in ('EUR', 'ARS', 'USD')"
            );

            builder.HasCheckConstraint(
                "ck_ef_programa_servicios_tipo_calculo",
                "tipo_calculo in ('POR_INSCRIPCION', 'POR_PERIODO', 'POR_DIA', 'POR_CANTIDAD')"
            );

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}