using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_relaciones_personaConfiguration : IEntityTypeConfiguration<ef_param_relaciones_persona>
    {
        public void Configure(EntityTypeBuilder<ef_param_relaciones_persona> builder)
        {
            builder.ToTable("ef_param_relaciones_persona", "public");

            builder.HasKey(x => x.id_relacion_persona)
                .HasName("ef_param_relaciones_persona_pkey");

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_param_relaciones_persona_codigo");

            builder.HasIndex(x => new { x.activo, x.orden })
                .HasDatabaseName("ix_ef_param_relaciones_persona_activo_orden");

            builder.Property(x => x.id_relacion_persona)
                .HasColumnName("id_relacion_persona");

            builder.Property(x => x.codigo)
                .HasColumnName("codigo")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .IsRequired()
                .HasDefaultValue((short)1);

            builder.Property(x => x.permite_responsable_inscripcion)
                .HasColumnName("permite_responsable_inscripcion")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.permite_autorizado_retiro)
                .HasColumnName("permite_autorizado_retiro")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.permite_rsvp_grupo)
                .HasColumnName("permite_rsvp_grupo")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");
        }
    }
}