using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_POF_AntigudadesConfiguration : IEntityTypeConfiguration<MEC_POF_Antiguedades>
    {
        public void Configure(EntityTypeBuilder<MEC_POF_Antiguedades> builder)
        {
            // Definir clave primaria
            builder.HasKey(e => e.IdPOF);

            // Definir restricciones para las columnas
            builder.Property(e => e.MesReferencia)
                .IsRequired();

            builder.Property(e => e.AnioReferencia)
                .IsRequired();

            builder.Property(e => e.AnioAntiguedad)
                .IsRequired(false);

            builder.Property(e => e.MesAntiguedad)
                .IsRequired(false); 
            
            builder
                .HasOne(p => p.POF)
                .WithOne()
                .HasForeignKey<MEC_POF_Antiguedades>(p => p.IdPOF)
                .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            // Agregar restricciones CHECK directamente sobre el EntityTypeBuilder
            builder.HasCheckConstraint("CK_MesReferencia", "[MesReferencia] BETWEEN 1 AND 12");
            builder.HasCheckConstraint("CK_AnioReferencia", "[AnioReferencia] BETWEEN 2024 AND 3000");
            builder.HasCheckConstraint("CK_AnioAntiguedad", "[AnioAntiguedad] <= 99");
            builder.HasCheckConstraint("CK_MesAntiguedad", "[MesAntiguedad] BETWEEN 0 AND 11");
        }
    }
}
