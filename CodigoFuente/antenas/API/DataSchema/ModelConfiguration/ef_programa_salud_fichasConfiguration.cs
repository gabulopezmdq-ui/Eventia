using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_salud_fichasConfiguration : IEntityTypeConfiguration<ef_programa_salud_fichas>
    {
        public void Configure(EntityTypeBuilder<ef_programa_salud_fichas> builder)
        {
            builder.ToTable("ef_programa_salud_fichas", "public");

            builder.HasKey(x => x.id_ficha_salud);

            builder.Property(x => x.id_ficha_salud)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_inscripcion).IsRequired();

            builder.Property(x => x.tiene_problema_medico)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.detalle_problema_medico)
                   .HasColumnType("text");

            builder.Property(x => x.tiene_alergias_no_alimentarias)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.detalle_alergias_no_alimentarias)
                   .HasColumnType("text");

            builder.Property(x => x.tiene_necesidad_especial)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.detalle_necesidad_especial)
                   .HasColumnType("text");

            builder.Property(x => x.tiene_cobertura_medica)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.cobertura_medica_nombre)
                   .HasMaxLength(150);

            builder.Property(x => x.cobertura_medica_numero)
                   .HasMaxLength(80);

            builder.Property(x => x.contacto_emergencia_nombre)
                   .HasMaxLength(150);

            builder.Property(x => x.contacto_emergencia_telefono)
                   .HasMaxLength(50);

            builder.Property(x => x.contacto_emergencia_relacion)
                   .HasMaxLength(80);

            builder.Property(x => x.autoriza_emergencia_medica)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.observaciones_familia)
                   .HasColumnType("text");

            builder.Property(x => x.observaciones_internas)
                   .HasColumnType("text");

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_evento, x.id_inscripcion })
                   .IsUnique()
                   .HasDatabaseName("ux_prog_salud_ficha_evento_inscripcion");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_prog_salud_ficha_evento");

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_salud_ficha_inscripcion");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_prog_salud_ficha_evento_activo");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}