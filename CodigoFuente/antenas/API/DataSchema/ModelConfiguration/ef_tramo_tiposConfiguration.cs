using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_tramo_tiposConfiguration : IEntityTypeConfiguration<ef_tramo_tipos>
    {
        public void Configure(EntityTypeBuilder<ef_tramo_tipos> builder)
        {
            builder.ToTable("ef_tramo_tipos");

            builder.HasKey(x => x.id_tramo_tipo);

            builder.Property(x => x.id_tramo_tipo).ValueGeneratedOnAdd();
            builder.Property(x => x.codigo).HasMaxLength(30).IsRequired();
            builder.Property(x => x.activo).IsRequired();

            builder.HasIndex(x => x.codigo).IsUnique();

            builder.HasMany(x => x.evento_tramos)
                    .WithOne(t => t.tramo_tipo)
                    .HasForeignKey(t => t.id_tramo_tipo);

            //builder.HasMany(x => x.plantilla_tramos)
            //        .WithOne(t => t.tramo_tipo)
            //        .HasForeignKey(t => t.id_tramo_tipo);
        }
    }
}
