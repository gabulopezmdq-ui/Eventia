using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_salud_medicacionesConfiguration : IEntityTypeConfiguration<ef_programa_salud_medicaciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_salud_medicaciones> builder)
        {
            builder.ToTable("ef_programa_salud_medicaciones", "public");

            builder.HasKey(x => x.id_medicacion);

            builder.Property(x => x.id_medicacion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_inscripcion).IsRequired();

            builder.Property(x => x.nombre_medicamento)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.dosis).HasMaxLength(100);
            builder.Property(x => x.frecuencia).HasMaxLength(100);
            builder.Property(x => x.horario).HasMaxLength(100);

            builder.Property(x => x.instrucciones)
                   .HasColumnType("text");

            builder.Property(x => x.administracion_autorizada)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.debe_llevar_participante)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.requiere_refrigeracion)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_prog_salud_med_evento");

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_salud_med_inscripcion");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_prog_salud_med_activo");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}