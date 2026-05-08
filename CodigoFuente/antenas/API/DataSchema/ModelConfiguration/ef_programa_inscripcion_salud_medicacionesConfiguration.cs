using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_salud_medicacionesConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_salud_medicaciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_salud_medicaciones> builder)
        {
            builder.ToTable("ef_programa_inscripcion_salud_medicaciones", "public");

            builder.HasKey(x => x.id_medicacion);

            builder.Property(x => x.id_medicacion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_salud_ficha)
                   .IsRequired();

            builder.Property(x => x.nombre_medicacion)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.dosis)
                   .HasMaxLength(80);

            builder.Property(x => x.frecuencia)
                   .HasMaxLength(80);

            builder.Property(x => x.horario)
                   .HasMaxLength(80);

            builder.Property(x => x.indicaciones)
                   .HasColumnType("text");

            builder.Property(x => x.requiere_autorizacion)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.HasIndex(x => x.id_salud_ficha)
                   .HasDatabaseName("ix_prog_insc_salud_medicacion_ficha");

            builder.HasOne(x => x.salud_ficha)
                   .WithMany()
                   .HasForeignKey(x => x.id_salud_ficha)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}