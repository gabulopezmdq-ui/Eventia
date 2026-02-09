using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plantilla_acceso_tramosConfiguration : IEntityTypeConfiguration<ef_plantilla_acceso_tramos>
    {
        public void Configure(EntityTypeBuilder<ef_plantilla_acceso_tramos> builder)
        {
            builder.ToTable("ef_plantilla_acceso_tramos");

            builder.HasKey(x => new { x.id_plantilla_acceso, x.id_plantilla_tramo });

            builder.HasOne(x => x.plantilla_acceso)
                   .WithMany(a => a.acceso_tramos)
                   .HasForeignKey(x => x.id_plantilla_acceso)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.plantilla_tramo)
                   .WithMany(t => t.acceso_tramos)
                   .HasForeignKey(x => x.id_plantilla_tramo)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
