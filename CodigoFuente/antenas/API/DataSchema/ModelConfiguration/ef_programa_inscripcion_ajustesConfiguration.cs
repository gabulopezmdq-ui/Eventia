using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_ajustesConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_ajustes>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_ajustes> builder)
        {
            builder.ToTable("ef_programa_inscripcion_ajustes", "public");

            builder.HasKey(x => x.id_inscripcion_ajuste);

            builder.Property(x => x.id_inscripcion_ajuste)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion)
                .IsRequired();

            builder.Property(x => x.tipo)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.id_tipo_ajuste)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasMaxLength(300);

            builder.Property(x => x.importe)
                .HasPrecision(12, 2)
                .IsRequired();

            builder.Property(x => x.moneda)
                .HasMaxLength(3)
                .IsRequired();

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                .HasDatabaseName("ix_prog_insc_ajuste_inscripcion");

            builder.HasOne(x => x.inscripcion)
                .WithMany()
                .HasForeignKey(x => x.id_inscripcion)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.tipo_ajuste)
                .WithMany()
                .HasForeignKey(x => x.id_tipo_ajuste)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}