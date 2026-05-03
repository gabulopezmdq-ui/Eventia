using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_autorizacionesConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_autorizaciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_autorizaciones> builder)
        {
            builder.ToTable("ef_programa_inscripcion_autorizaciones", "public");

            builder.HasKey(x => x.id_inscripcion_autorizacion);

            builder.Property(x => x.id_inscripcion_autorizacion)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion)
                .IsRequired();

            builder.Property(x => x.id_rsvp_grupo_integrante);

            builder.Property(x => x.id_programa_autorizacion_config)
                .IsRequired();

            builder.Property(x => x.codigo)
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(x => x.texto_aceptado)
                .HasColumnType("text")
                .IsRequired();

            builder.Property(x => x.aceptada)
                .IsRequired();

            builder.Property(x => x.fecha_aceptacion)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.nombre_firmante)
                .HasMaxLength(200);

            builder.Property(x => x.ip_aceptacion)
                .HasMaxLength(80);

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                .HasDatabaseName("ix_prog_insc_aut_inscripcion");

            builder.HasIndex(x => x.id_rsvp_grupo_integrante)
                .HasDatabaseName("ix_prog_insc_aut_integrante");

            builder.HasIndex(x => x.id_programa_autorizacion_config)
                .HasDatabaseName("ix_prog_insc_aut_config");

            builder.HasIndex(x => new
            {
                x.id_inscripcion,
                x.id_programa_autorizacion_config,
                x.id_rsvp_grupo_integrante
            })
            .IsUnique()
            .HasDatabaseName("ux_prog_insc_aut");

            builder.HasOne(x => x.inscripcion)
                .WithMany()
                .HasForeignKey(x => x.id_inscripcion)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.integrante)
                .WithMany()
                .HasForeignKey(x => x.id_rsvp_grupo_integrante)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.autorizacion_config)
                .WithMany()
                .HasForeignKey(x => x.id_programa_autorizacion_config)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}