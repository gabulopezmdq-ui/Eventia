using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_salud_fichasConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_salud_fichas>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_salud_fichas> builder)
        {
            builder.ToTable("ef_programa_inscripcion_salud_fichas", "public");

            builder.HasKey(x => x.id_salud_ficha);

            builder.Property(x => x.id_salud_ficha)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion)
                   .IsRequired();

            builder.Property(x => x.id_rsvp_grupo_integrante)
                   .IsRequired();

            builder.Property(x => x.tiene_problema_medico);
            builder.Property(x => x.problema_medico_detalle)
                   .HasColumnType("text");

            builder.Property(x => x.tiene_alergias_no_alimentarias);
            builder.Property(x => x.alergias_no_alimentarias_detalle)
                   .HasColumnType("text");

            builder.Property(x => x.necesidad_especial)
                   .HasColumnType("text");

            builder.Property(x => x.cobertura_medica)
                   .HasMaxLength(150);

            builder.Property(x => x.observaciones_familia)
                   .HasColumnType("text");

            builder.Property(x => x.autoriza_emergencia_medica);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_insc_salud_ficha_inscripcion");

            builder.HasIndex(x => x.id_rsvp_grupo_integrante)
                   .HasDatabaseName("ix_prog_insc_salud_ficha_integrante");

            builder.HasIndex(x => new { x.id_inscripcion, x.id_rsvp_grupo_integrante })
                   .IsUnique()
                   .HasDatabaseName("ux_prog_insc_salud_ficha_integrante");

            builder.HasOne(x => x.inscripcion)
                   .WithMany()
                   .HasForeignKey(x => x.id_inscripcion)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.integrante)
                   .WithMany()
                   .HasForeignKey(x => x.id_rsvp_grupo_integrante)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}