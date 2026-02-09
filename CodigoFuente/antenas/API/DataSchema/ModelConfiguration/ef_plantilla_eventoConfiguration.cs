using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plantillas_eventoConfiguration : IEntityTypeConfiguration<ef_plantillas_evento>
    {
        public void Configure(EntityTypeBuilder<ef_plantillas_evento> builder)
        {
            builder.ToTable("ef_plantillas_evento");

            builder.HasKey(x => x.id_plantilla);

            builder.Property(x => x.id_plantilla).ValueGeneratedOnAdd();
            builder.Property(x => x.codigo).HasMaxLength(30).IsRequired();
            builder.Property(x => x.activo).IsRequired();

            builder.HasIndex(x => x.codigo).IsUnique();

            builder.HasMany(x => x.tramos)
                   .WithOne(t => t.plantilla)
                   .HasForeignKey(t => t.id_plantilla);

            builder.HasMany(x => x.accesos)
                   .WithOne(a => a.plantilla)
                   .HasForeignKey(a => a.id_plantilla);
        }
    }
}
