using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_periodosConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_periodos>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_periodos> builder)
        {
            builder.ToTable("ef_programa_inscripcion_periodos", "public");

            builder.HasKey(x => x.id_inscripcion_periodo);

            builder.Property(x => x.id_inscripcion_periodo).ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion).IsRequired();
            builder.Property(x => x.id_rsvp_grupo_integrante).IsRequired();
            builder.Property(x => x.id_programa_periodo).IsRequired();

            builder.Property(x => x.codigo).HasMaxLength(40).IsRequired();
            builder.Property(x => x.nombre).HasMaxLength(120).IsRequired();
            builder.Property(x => x.fecha_desde).IsRequired();
            builder.Property(x => x.fecha_hasta).IsRequired();

            builder.Property(x => x.precio_base)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired()
                   .HasDefaultValue("EUR")
                   .IsUnicode(false);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_insc_per_inscripcion");

            builder.HasIndex(x => x.id_rsvp_grupo_integrante)
                   .HasDatabaseName("ix_prog_insc_per_integrante");

            builder.HasIndex(x => x.id_programa_periodo)
                   .HasDatabaseName("ix_prog_insc_per_periodo");

            builder.HasIndex(x => new { x.id_inscripcion, x.id_rsvp_grupo_integrante, x.id_programa_periodo })
                   .IsUnique()
                   .HasDatabaseName("ux_prog_insc_per_integrante_periodo");

            builder.HasOne(x => x.inscripcion)
                   .WithMany()
                   .HasForeignKey(x => x.id_inscripcion)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.integrante)
                   .WithMany()
                   .HasForeignKey(x => x.id_rsvp_grupo_integrante)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.programa_periodo)
                   .WithMany()
                   .HasForeignKey(x => x.id_programa_periodo)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasCheckConstraint(
                "ck_prog_insc_per_precio",
                "precio_base >= 0"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_per_fechas",
                "fecha_hasta >= fecha_desde"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_per_moneda",
                "moneda in ('EUR', 'ARS', 'USD')"
            );
        }
    }
}