using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_mesasConfiguration : IEntityTypeConfiguration<ef_evento_mesas>
    {
        public void Configure(EntityTypeBuilder<ef_evento_mesas> builder)
        {
            builder.ToTable("ef_evento_mesas");
            builder.HasKey(x => x.id_mesa);

            builder.Property(x => x.id_mesa).ValueGeneratedOnAdd();
            builder.Property(x => x.nombre).HasMaxLength(50).IsRequired();
            builder.Property(x => x.notas).HasMaxLength(250);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");

            builder.HasOne(x => x.tramo)
                .WithMany()
                .HasForeignKey(x => x.id_tramo)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
