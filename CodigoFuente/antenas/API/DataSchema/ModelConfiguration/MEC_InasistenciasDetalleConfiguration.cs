using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_InasistenciasDetalleConfiguration : IEntityTypeConfiguration<MEC_InasistenciasDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_InasistenciasDetalle> builder)
        {
            builder
                .HasKey(k => k.IdInasistenciasDetalle);

            builder
                .Property(p => p.IdInasistenciasDetalle)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.IdInasistenciasCabecera).IsRequired();
            builder.Property(p => p.IdEstablecimiento).IsRequired();
            builder.Property(p => p.IdPOF).IsRequired();
            builder.Property(p => p.IdPOFBarra).IsRequired();
            builder.Property(p => p.Fecha).IsRequired();
            builder.Property(p => p.IdTMPInasistenciasDetalle).IsRequired(false);
            builder.Property(p => p.CodLicencia).IsRequired(false);

            // Relaciones
            builder.HasOne(p => p.Establecimiento)
                .WithMany()
                .HasForeignKey(p => p.IdEstablecimiento)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.POF)
                .WithMany()
                .HasForeignKey(p => p.IdPOF)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.POFBarra)
                .WithMany()
                .HasForeignKey(p => p.IdPOFBarra)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.TMPInasistenciasDetalle)
                .WithMany()
                .HasForeignKey(p => p.IdTMPInasistenciasDetalle)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
