using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plantilla_accesosConfiguration : IEntityTypeConfiguration<ef_plantilla_accesos>
    {
        public void Configure(EntityTypeBuilder<ef_plantilla_accesos> builder)
        {
            builder.ToTable("ef_plantilla_accesos");

            builder.HasKey(x => x.id_plantilla_acceso);

            builder.Property(x => x.id_plantilla_acceso).ValueGeneratedOnAdd();
            builder.Property(x => x.nombre_default).HasMaxLength(80).IsRequired();
            builder.Property(x => x.mensaje_rsvp_default).HasMaxLength(500);

            builder.Property(x => x.es_publico_default).IsRequired();
            builder.Property(x => x.orden).IsRequired();
            builder.Property(x => x.es_default).IsRequired();
            builder.Property(x => x.activo).IsRequired();

            builder.HasIndex(x => new { x.id_plantilla, x.orden }).IsUnique();

            builder.HasMany(x => x.acceso_tramos)
                   .WithOne(x => x.plantilla_acceso)
                   .HasForeignKey(x => x.id_plantilla_acceso);
        }
    }
}
