using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcionesConfiguration : IEntityTypeConfiguration<ef_programa_inscripciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripciones> builder)
        {
            builder.ToTable("ef_programa_inscripciones", "public");

            builder.HasKey(x => x.id_inscripcion);

            builder.Property(x => x.id_inscripcion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.id_acceso);

            builder.Property(x => x.id_acceso_link);

            builder.Property(x => x.id_rsvp_grupo);

            builder.Property(x => x.id_invitado_responsable);

            builder.Property(x => x.id_audiencia_persona_responsable);

            builder.Property(x => x.responsable_nombre)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.responsable_apellido)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.responsable_email)
                   .HasMaxLength(200);

            builder.Property(x => x.responsable_telefono)
                   .HasMaxLength(50);

            builder.Property(x => x.responsable_documento)
                   .HasMaxLength(80);

            builder.Property(x => x.responsable_relacion)
                   .HasMaxLength(80);

            builder.Property(x => x.firma_nombre)
                   .HasMaxLength(200);

            builder.Property(x => x.firma_fecha);

            builder.Property(x => x.estado)
                   .HasMaxLength(30)
                   .IsRequired()
                   .HasDefaultValue("BORRADOR");

            builder.Property(x => x.id_idioma);

            builder.Property(x => x.moneda)
                   .HasMaxLength(3)
                   .IsRequired()
                   .HasDefaultValue("EUR")
                   .IsUnicode(false);

            builder.Property(x => x.total_base)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.total_servicios)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.total_general)
                   .HasPrecision(12, 2)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(x => x.token_consulta)
                   .HasMaxLength(80);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_confirmacion);

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_prog_insc_evento");

            builder.HasIndex(x => new { x.id_evento, x.estado })
                   .HasDatabaseName("ix_prog_insc_evento_estado");

            builder.HasIndex(x => x.id_rsvp_grupo)
                   .HasDatabaseName("ix_prog_insc_rsvp_grupo");

            builder.HasIndex(x => x.id_invitado_responsable)
                   .HasDatabaseName("ix_prog_insc_inv_responsable");

            builder.HasIndex(x => x.responsable_email)
                   .HasDatabaseName("ix_prog_insc_email");

            builder.HasIndex(x => x.token_consulta)
                   .IsUnique()
                   .HasDatabaseName("ux_prog_insc_token_consulta")
                   .HasFilter("token_consulta is not null");

            builder.HasIndex(x => x.id_rsvp_grupo)
                   .IsUnique()
                   .HasDatabaseName("ux_prog_insc_rsvp_grupo")
                   .HasFilter("id_rsvp_grupo is not null");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.acceso)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.acceso_link)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso_link)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.rsvp_grupo)
                   .WithMany()
                   .HasForeignKey(x => x.id_rsvp_grupo)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.invitado_responsable)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado_responsable)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.audiencia_persona_responsable)
                   .WithMany()
                   .HasForeignKey(x => x.id_audiencia_persona_responsable)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasCheckConstraint(
                "ck_prog_insc_estado",
                "estado in ('BORRADOR', 'CONFIRMADA', 'CANCELADA', 'LISTA_ESPERA')"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_totales",
                "total_base >= 0 and total_servicios >= 0 and total_general >= 0"
            );

            builder.HasCheckConstraint(
                "ck_prog_insc_moneda",
                "moneda in ('EUR', 'ARS', 'USD')"
            );
        }
    }
}