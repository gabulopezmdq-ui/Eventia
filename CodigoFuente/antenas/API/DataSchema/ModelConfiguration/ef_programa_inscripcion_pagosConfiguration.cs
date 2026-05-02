using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_pagosConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_pagos>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_pagos> builder)
        {
            builder.ToTable("ef_programa_inscripcion_pagos", "public");

            builder.HasKey(x => x.id_inscripcion_pago);

            builder.Property(x => x.id_inscripcion_pago)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_inscripcion)
                .IsRequired();

            builder.Property(x => x.fecha_pago)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.importe)
                .HasPrecision(12, 2)
                .IsRequired();

            builder.Property(x => x.moneda)
                .HasMaxLength(3)
                .IsRequired();

            builder.Property(x => x.medio_pago)
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.referencia)
                .HasMaxLength(120);

            builder.Property(x => x.observaciones)
                .HasMaxLength(300);

            builder.Property(x => x.anulado)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.fecha_anulacion);

            builder.Property(x => x.motivo_anulacion)
                .HasMaxLength(300);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_inscripcion)
                .HasDatabaseName("ix_prog_insc_pago_inscripcion");

            builder.HasOne(x => x.inscripcion)
                .WithMany()
                .HasForeignKey(x => x.id_inscripcion)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}