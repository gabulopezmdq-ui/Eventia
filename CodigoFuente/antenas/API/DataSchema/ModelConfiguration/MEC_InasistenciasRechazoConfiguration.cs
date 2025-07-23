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

            builder.Property(ir => ir.UsuarioRechazo)
                .IsRequired(false);

            builder.HasOne(ir => ir.Usuario)
                .WithMany()
                .HasForeignKey(ir => ir.UsuarioRechazo);

            builder.HasOne(r => r.InasistenciaDetalle)
                  .WithMany() 
                  .HasForeignKey(r => r.IdInasistenciaDetalle)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }

}