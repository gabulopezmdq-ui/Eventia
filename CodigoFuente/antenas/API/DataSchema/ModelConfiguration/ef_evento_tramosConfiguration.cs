using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_tramosConfiguration : IEntityTypeConfiguration<ef_evento_tramos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_tramos> builder)
        {
            builder.ToTable("ef_evento_tramos");

            builder.HasKey(x => x.id_tramo);

            builder.Property(x => x.id_tramo).ValueGeneratedOnAdd();
            builder.Property(x => x.nombre).HasMaxLength(80).IsRequired();
            builder.Property(x => x.leyenda_visible).HasMaxLength(200);
            builder.Property(x => x.notas_internas)
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(x => x.fecha_hora_inicio).IsRequired();
            builder.Property(x => x.fecha_hora_fin);

            builder.Property(x => x.lugar).HasMaxLength(200);
            builder.Property(x => x.direccion).HasMaxLength(200);

            builder.Property(x => x.latitud).HasColumnType("numeric(9,6)");
            builder.Property(x => x.longitud).HasColumnType("numeric(9,6)");

            builder.Property(x => x.orden).IsRequired();
            builder.Property(x => x.activo).IsRequired();

            builder.Property(x => x.fecha_alta).IsRequired();
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento);
            builder.HasIndex(x => new { x.id_evento, x.orden }).IsUnique();

            // Relación con evento (tabla existente)
            builder.HasOne(x => x.evento)
                   .WithMany() // si en ef_eventos no tenés nav, dejalo así
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            // Acceso <->Tramos
            builder.HasMany(x => x.acceso_tramos)
                   .WithOne(x => x.tramo)
                   .HasForeignKey(x => x.id_tramo);
        }
    }
}
