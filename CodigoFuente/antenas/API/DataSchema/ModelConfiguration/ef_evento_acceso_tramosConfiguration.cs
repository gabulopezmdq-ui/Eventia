using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_acceso_tramosConfiguration : IEntityTypeConfiguration<ef_evento_acceso_tramos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_acceso_tramos> builder)
        {
            builder.ToTable("ef_evento_acceso_tramos");

            builder.HasKey(x => new { x.id_acceso, x.id_tramo });

            builder.HasOne(x => x.acceso)
                   .WithMany(a => a.acceso_tramos)
                   .HasForeignKey(x => x.id_acceso)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.tramo)
                   .WithMany(t => t.acceso_tramos)
                   .HasForeignKey(x => x.id_tramo)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.id_tramo);
        }
    }
}
