using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_serviciosConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_servicios>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_servicios> builder)
        {
            builder.ToTable("ef_programa_inscripcion_servicios", "public");

            builder.HasKey(x => x.id_inscripcion_servicio);

            builder.Property(x => x.id_inscripcion_servicio).ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion).IsRequired();
            builder.Property(x => x.id_rsvp_grupo_integrante).IsRequired();
            builder.Property(x => x.id_programa_servicio).IsRequired();
            builder.Property(x => x.id_programa_periodo);

            builder.Property(x => x.codigo).HasMaxLength(40).IsRequired();
            builder.Property(x => x.nombre).HasMaxLength(120).IsRequired();

            builder.Property(x => x.tipo_calculo)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.precio)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired()
                   .HasDefaultValue("EUR")
                   .IsUnicode(false);

            builder.Property(x => x.cantidad);

            builder.Property(x => x.campos_extra_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.subtotal)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_insc_serv_inscripcion");

            builder.HasIndex(x => x.id_rsvp_grupo_integrante)
                   .HasDatabaseName("ix_prog_insc_serv_integrante");

            builder.HasIndex(x => x.id_programa_servicio)
                   .HasDatabaseName("ix_prog_insc_serv_servicio");

            builder.HasIndex(x => x.id_programa_periodo)
                   .HasDatabaseName("ix_prog_insc_serv_periodo");

            builder.HasOne(x => x.inscripcion)
                   .WithMany()
                   .HasForeignKey(x => x.id_inscripcion)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.integrante)
                   .WithMany()
                   .HasForeignKey(x => x.id_rsvp_grupo_integrante)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.programa_servicio)
                   .WithMany()
                   .HasForeignKey(x => x.id_programa_servicio)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.programa_periodo)
                   .WithMany()
                   .HasForeignKey(x => x.id_programa_periodo)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasCheckConstraint(
                "ck_prog_insc_serv_tipo",
                "tipo_calculo in ('POR_DIA', 'POR_PERIODO', 'POR_INSCRIPCION', 'POR_CANTIDAD')"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_serv_precio",
                "precio >= 0 and subtotal >= 0"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_serv_cantidad",
                "cantidad is null or cantidad >= 0"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_serv_moneda",
                "moneda in ('EUR', 'ARS', 'USD')"
            );
        }
    }
}