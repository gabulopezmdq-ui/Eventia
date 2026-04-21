using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_staff_unidadesConfiguration : IEntityTypeConfiguration<ef_staff_unidades>
    {
        public void Configure(EntityTypeBuilder<ef_staff_unidades> builder)
        {
            builder.ToTable("ef_staff_unidades");

            // Clave primaria compuesta
            builder.HasKey(x => new { x.id_staff, x.id_unidad });

            // FK: ef_staff
            builder.HasOne(x => x.ef_staff)
                   .WithMany()
                   .HasForeignKey(x => x.id_staff)
                   .OnDelete(DeleteBehavior.Cascade);

            // FK: ef_cuenta_unidades
            builder.HasOne(x => x.ef_cuenta_unidades)
                   .WithMany()
                   .HasForeignKey(x => x.id_unidad)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
