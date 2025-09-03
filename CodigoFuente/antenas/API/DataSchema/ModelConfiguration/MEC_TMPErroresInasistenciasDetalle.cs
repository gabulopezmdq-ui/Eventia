using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPErroresInasistenciasDetalleConfiguration : IEntityTypeConfiguration<MEC_TMPErroresInasistenciasDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPErroresInasistenciasDetalle> builder)
        {
            builder.HasKey(e => e.IdTMPErrorInasistencia);

            builder.Property(e => e.IdTMPErrorInasistencia)
                .HasColumnName("IdTMPErrorInasistencia")
                .UseIdentityColumn();

            builder.Property(e => e.IdCabeceraInasistencia)
                .HasColumnName("IdCabeceraInasistencia")
                .IsRequired();

            builder.Property(e => e.IdTMPInasistenciasDetalle)
                .HasColumnName("IdTMPInasistenciasDetalle")
                .IsRequired();

            builder.Property(e => e.Documento)
                .HasColumnName("Documento")
                .HasColumnType("char(8)");

            builder.Property(e => e.Legajo)
                .HasColumnName("Legajo")
                .HasColumnType("char(2)");

            builder.Property(e => e.POF)
                .HasColumnName("POF")
                .HasColumnType("char(2)");

            builder.Property(e => e.POFBarra)
                .HasColumnName("POFBarra")
                .HasColumnType("char(2)");

            builder.HasOne(e => e.Cabecera)
      .WithMany(c => c.ErroresTMPInasistenciasDetalle)
      .HasForeignKey(e => e.IdCabeceraInasistencia)
      .HasPrincipalKey(c => c.IdCabecera);

            builder.HasOne(e => e.TMPInasistencia)
                .WithMany(t => t.ErroresTMPInasistenciasDetalle)
                .HasForeignKey(e => e.IdTMPInasistenciasDetalle)
                .HasPrincipalKey(t => t.IdTMPInasistenciasDetalle);

        }
    }
}
