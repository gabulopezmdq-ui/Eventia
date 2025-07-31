using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_InasistenciasRechazoConfiguration : IEntityTypeConfiguration<MEC_InasistenciasRechazo>
    {
        public void Configure(EntityTypeBuilder<MEC_InasistenciasRechazo> builder) 
        {
            builder
               .HasKey(k => k.IdInasistenciaRechazo);

            builder.Property(ir => ir.MotivoRechazo)
              .HasColumnType("varchar")
              .IsRequired(false);

            builder.Property(ir => ir.FechaEnvio)
                .HasColumnType("date")
                .IsRequired(false);

            builder.Property(ir => ir.IdUsuario)
                .IsRequired(false);

            builder.HasOne(d => d.Usuario)
     .WithMany(t => t.Rechazo)
     .HasForeignKey(d => d.IdUsuario)
     .HasPrincipalKey(u => u.IdUsuario);

            builder
               .Navigation(e => e.Usuario)
               .AutoInclude()
               .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.HasOne(r => r.InasistenciaDetalle)
                  .WithMany()   
                  .HasForeignKey(r => r.IdInasistenciaDetalle)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.InasistenciaDetalle)
                    .WithMany(d => d.InasistenciasRechazos)
                    .HasForeignKey(r => r.IdInasistenciaDetalle);
        }
    }

}