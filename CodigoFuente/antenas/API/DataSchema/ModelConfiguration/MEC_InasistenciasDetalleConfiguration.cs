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

            builder.Property(p => p.IdInasistenciaCabecera).IsRequired();
            builder.Property(p => p.IdEstablecimiento).IsRequired();
            builder.Property(p => p.IdPOF).IsRequired();
            builder.Property(p => p.IdPOFBarra).IsRequired(false);
            builder.Property(p => p.Fecha).IsRequired();
            builder.Property(p => p.IdTMPInasistenciasDetalle).IsRequired(false);
            builder.Property(p => p.CodLicencia).IsRequired(false);
            builder.Property(p => p.IdUsuario).HasColumnName("IdUsuario");

            // Relaciones
            builder.HasOne(p => p.Establecimiento)
                .WithMany(t => t.Detalle)
                .HasForeignKey(p => p.IdEstablecimiento);

            builder.HasOne(p => p.POF)
                .WithMany(t => t.Detalle)
                .HasForeignKey(p => p.IdPOF);

            builder.HasOne(p => p.POFBarra)
                .WithMany(t => t.Detalle)
                .HasForeignKey(p => p.IdPOFBarra);

            builder.HasOne(p => p.TMPInasistenciasDetalle)
                .WithMany(t => t.Detalle)
                .HasForeignKey(p => p.IdTMPInasistenciasDetalle);

            builder.HasOne(d => d.Usuario)
     .WithMany(t => t.Detalle) 
     .HasForeignKey(d => d.IdUsuario)
     .HasPrincipalKey(u => u.IdUsuario);


            builder
               .Navigation(e => e.Usuario)
               .AutoInclude()
               .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.HasMany(d => d.InasistenciasRechazos)
                .WithOne(r => r.InasistenciaDetalle)
                .HasForeignKey(r => r.IdInasistenciaDetalle);

            builder
              .HasOne(p => p.InasistenciaCabecera)
              .WithMany(t => t.Detalle)
              .HasForeignKey(p => p.IdInasistenciaCabecera)
              .IsRequired(true);

            builder
                .Navigation(e => e.InasistenciaCabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }
}
