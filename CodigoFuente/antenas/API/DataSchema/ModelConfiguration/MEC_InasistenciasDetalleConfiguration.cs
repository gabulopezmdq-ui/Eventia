using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_InasistenciasDetalleConfiguration : IEntityTypeConfiguration<MEC_InasistenciasDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_InasistenciasDetalle> builder)
        {
            builder
                .HasKey(k => k.IdInasistenciaDetalle);

            builder
                .Property(p => p.IdInasistenciaDetalle)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.InasistenciaCabecera)
                .WithMany(t => t.Detalle)
                .HasForeignKey(p => p.IdInasistenciaCabecera)
                .IsRequired(true);

           // builder
           //     .Navigation(e => e.IdInasistenciaCabecera)
           //     .AutoInclude()
           //     .UsePropertyAccessMode(PropertyAccessMode.Property);

           // builder
           //     .HasOne(p => p.Usuarios)
           //     .WithMany(t => t.Inasistencias)
           //     .HasForeignKey(p => p.Confecciono)
           //     .IsRequired(true);

           // builder
           //     .Navigation(e => e.Usuarios)
           //     .AutoInclude()
           //     .UsePropertyAccessMode(PropertyAccessMode.Property);

           // builder
           // .HasOne(p => p.Cabecera)
           // .WithMany(t => t.Cabeceras)
           // .HasForeignKey(p => p.IdCabecera)
           // .IsRequired(true);

           // builder
           //     .Navigation(e => e.Cabecera)
           //     .AutoInclude()
           //     .UsePropertyAccessMode(PropertyAccessMode.Property);

           // builder.Property(e => e.Mes)
           //     .IsRequired(true);

           // builder.Property(e => e.Anio)
           //     .IsRequired(true);

           // builder.Property(e => e.FechaApertura)
           //     .IsRequired(true);

           // builder.Property(e => e.FechaEntrega)
           //    .IsRequired(true);

           // builder.Property(e => e.SinNovedades)
           //     .HasColumnType("char(1)")
           //     .IsFixedLength(true)
           //     .IsRequired(true);

           // builder.Property(e => e.Observaciones)
           // .HasColumnType("char(1000)")
           // .IsFixedLength(true)
           // .IsRequired(true);

           // builder.Property(e => e.Estado)
           //.HasColumnType("char(1)")
           //.IsFixedLength(true)
           //.IsRequired(true);

        }
    }
}
