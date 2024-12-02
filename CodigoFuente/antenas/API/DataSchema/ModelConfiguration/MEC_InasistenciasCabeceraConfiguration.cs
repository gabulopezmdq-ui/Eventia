using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_InasistenciasCabeceraConfiguration : IEntityTypeConfiguration<MEC_InasistenciasCabecera>
    {
        public void Configure(EntityTypeBuilder<MEC_InasistenciasCabecera> builder)
        {
            builder
                .HasKey(k => k.IdInasistenciaCabecera);

            builder
                .Property(p => p.IdInasistenciaCabecera)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.Establecimientos)
                .WithMany(t => t.Inasistencias)
                .HasForeignKey(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimientos)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Mes)
                .IsRequired(true);

            builder.Property(e => e.Anio)
                .IsRequired(true);

            builder.Property(e => e.FechaApertura)
                .IsRequired(true);

            builder.Property(e => e.FechaEntrega)
                .IsRequired(true);

            builder
                .HasOne(p => p.CarRevista)
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdCarRevista)
                .IsRequired(true);

            builder
                .Navigation(e => e.CarRevista)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.HasMany(e => e.POFAntiguedad)
                .WithOne(e => e.POF)
                .HasForeignKey(e => e.IdPOF);

        }
    }
}
