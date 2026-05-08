using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_servicio_diasConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_servicio_dias>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_servicio_dias> builder)
        {
            builder.ToTable("ef_programa_inscripcion_servicio_dias", "public");

            builder.HasKey(x => x.id_inscripcion_servicio_dia);

            builder.Property(x => x.id_inscripcion_servicio_dia).ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion_servicio).IsRequired();

            builder.Property(x => x.fecha).IsRequired();

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion_servicio)
                   .HasDatabaseName("ix_prog_insc_serv_dia_servicio");

            builder.HasIndex(x => x.fecha)
                   .HasDatabaseName("ix_prog_insc_serv_dia_fecha");

            builder.HasIndex(x => new { x.id_inscripcion_servicio, x.fecha })
                   .IsUnique()
                   .HasDatabaseName("ux_prog_insc_serv_dia");

            builder.HasOne(x => x.inscripcion_servicio)
                   .WithMany()
                   .HasForeignKey(x => x.id_inscripcion_servicio)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}