using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPInasistenciasDetalleConfiguration : IEntityTypeConfiguration<MEC_TMPInasistenciasDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPInasistenciasDetalle> builder)
        {

            builder
                 .HasKey(k => k.IdTMPInasistenciasDetalle);

            builder
                .Property(p => p.IdTMPInasistenciasDetalle)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.IdCabecera)
                .HasColumnName("IdCabecera")
                .IsRequired(true);

            builder.Property(e => e.IdInasistenciaCabecera)
                .HasColumnName("IdInasistenciaCabecera")
                .IsRequired(true);

            builder.Property(e => e.DNI)
                .HasColumnName("DNI")
                .HasColumnType("char(8)");

            builder.Property(e => e.NroLegajo)
                .HasColumnName("NroLegajo");

            builder.Property(e => e.NroCargo)
                .HasColumnName("NroCargo");

            builder.Property(e => e.UE)
                .HasColumnName("UE")
                .HasColumnType("char(9)");

            builder.Property(e => e.Grupo)
                .HasColumnName("Grupo");

            builder.Property(e => e.Nivel)
                .HasColumnName("Nivel");

            builder.Property(e => e.Modulo)
                .HasColumnName("Modulo");

            builder.Property(e => e.Cargo)
                .HasColumnName("Cargo");

            builder.Property(e => e.FecNov)
                .HasColumnName("FecNov")
                .HasColumnType("date");

            builder.Property(e => e.CodLicen)
                .HasColumnName("CodLicen");

            builder.Property(e => e.Cantidad)
                .HasColumnName("Cantidad");

            builder.Property(e => e.Hora)
                .HasColumnName("Hora");

            builder.Property(e => e.RegistroValido)
                .HasColumnName("RegistroValido")
                .HasColumnType("char(1)");

            builder.Property(e => e.RegistroProcesado)
                .HasColumnName("RegistroProcesado")
                .HasColumnType("char(1)");

            // Relaciones
            builder.HasOne(e => e.CabeceraLiquidacion)
                .WithMany(e => e.TMPInasistenciasDetalle)
                .HasForeignKey(e => e.IdCabecera);

            builder.HasOne(e => e.InasistenciasCabecera)
                .WithMany(e => e.TMPInasistenciasDetalle)
                .HasForeignKey(e => e.IdInasistenciaCabecera);
        }
    }
}