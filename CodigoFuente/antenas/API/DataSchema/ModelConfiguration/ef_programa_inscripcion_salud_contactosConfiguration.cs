using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_inscripcion_salud_contactosConfiguration : IEntityTypeConfiguration<ef_programa_inscripcion_salud_contactos>
    {
        public void Configure(EntityTypeBuilder<ef_programa_inscripcion_salud_contactos> builder)
        {
            builder.ToTable("ef_programa_inscripcion_salud_contactos", "public");

            builder.HasKey(x => x.id_contacto_emergencia);

            builder.Property(x => x.id_contacto_emergencia)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_salud_ficha)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.telefono)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.relacion)
                   .HasMaxLength(80);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.HasIndex(x => x.id_salud_ficha)
                   .HasDatabaseName("ix_prog_insc_salud_contacto_ficha");

            builder.HasOne(x => x.salud_ficha)
                   .WithMany()
                   .HasForeignKey(x => x.id_salud_ficha)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
