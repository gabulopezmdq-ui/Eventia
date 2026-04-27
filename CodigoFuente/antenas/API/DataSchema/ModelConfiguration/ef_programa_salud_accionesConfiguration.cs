using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_salud_accionesConfiguration : IEntityTypeConfiguration<ef_programa_salud_acciones>
    {
        public void Configure(EntityTypeBuilder<ef_programa_salud_acciones> builder)
        {
            builder.ToTable("ef_programa_salud_acciones", "public");

            builder.HasKey(x => x.id_accion_salud);

            builder.Property(x => x.id_accion_salud)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_inscripcion).IsRequired();

            builder.Property(x => x.fecha_hora)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.tipo_accion)
                   .HasMaxLength(40)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.descripcion)
                   .HasColumnType("text")
                   .IsRequired();

            builder.Property(x => x.requirio_contacto_familia)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.contacto_realizado)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.requiere_seguimiento)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.usuario_registro);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_prog_salud_acc_evento");

            builder.HasIndex(x => x.id_inscripcion)
                   .HasDatabaseName("ix_prog_salud_acc_inscripcion");

            builder.HasIndex(x => new { x.id_evento, x.fecha_hora })
                   .HasDatabaseName("ix_prog_salud_acc_evento_fecha");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_prog_salud_acc_activo");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.usuario)
                   .WithMany()
                   .HasForeignKey(x => x.usuario_registro)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}