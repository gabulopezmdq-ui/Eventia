using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plantilla_tramosConfiguration : IEntityTypeConfiguration<ef_plantilla_tramos>
    {
        public void Configure(EntityTypeBuilder<ef_plantilla_tramos> builder)
        {
            builder.ToTable("ef_plantilla_tramos");

            builder.HasKey(x => x.id_plantilla_tramo);

            builder.Property(x => x.id_plantilla_tramo).ValueGeneratedOnAdd();
            builder.Property(x => x.nombre_default).HasMaxLength(80).IsRequired();
            builder.Property(x => x.leyenda_default).HasMaxLength(200);

            builder.Property(x => x.orden).IsRequired();
            builder.Property(x => x.activo).IsRequired();

            builder.HasIndex(x => new { x.id_plantilla, x.orden }).IsUnique();

            builder.HasMany(x => x.acceso_tramos)
                   .WithOne(x => x.plantilla_tramo)
                   .HasForeignKey(x => x.id_plantilla_tramo);
        }
    }
}
