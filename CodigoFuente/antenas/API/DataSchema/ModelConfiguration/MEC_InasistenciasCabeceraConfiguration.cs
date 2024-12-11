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

            builder
                .HasOne(p => p.Usuarios)
                .WithMany(t => t.Inasistencias)
                .HasForeignKey(p => p.Confecciono)
                .IsRequired(true);

            builder
                .Navigation(e => e.Usuarios)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
            .HasOne(p => p.Cabecera)
            .WithMany(t => t.Cabeceras)
            .HasForeignKey(p => p.IdCabecera)
            .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
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

            builder.Property(e => e.SinNovedades)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Observaciones)
            .HasColumnType("char(1000)")
            .IsFixedLength(true)
            .IsRequired(true);

            builder.Property(e => e.Estado)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(true);

        }
    }
}
