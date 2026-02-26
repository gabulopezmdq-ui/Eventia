using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_accesosConfiguration : IEntityTypeConfiguration<ef_evento_accesos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_accesos> builder)
        {
            builder.ToTable("ef_evento_accesos");

            builder.HasKey(x => x.id_acceso);

            builder.Property(x => x.id_acceso).ValueGeneratedOnAdd();
            builder.Property(x => x.nombre).HasMaxLength(80).IsRequired();
            builder.Property(x => x.mensaje_rsvp).HasMaxLength(500);

            builder.Property(x => x.es_publico).IsRequired();
            builder.Property(x => x.precio).HasColumnType("numeric(10,2)");

            builder.Property(x => x.activo).IsRequired();
            builder.Property(x => x.orden).IsRequired();

            builder.Property(x => x.fecha_alta).IsRequired();
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento);
            builder.HasIndex(x => new { x.id_evento, x.nombre }).IsUnique();

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.acceso_tramos)
                   .WithOne(x => x.acceso)
                   .HasForeignKey(x => x.id_acceso);

            builder.HasMany(x => x.invitados)
                   .WithOne(i => i.acceso)
                   .HasForeignKey(i => i.id_acceso)
                   .HasPrincipalKey(a => a.id_acceso);
        }
    }
}
