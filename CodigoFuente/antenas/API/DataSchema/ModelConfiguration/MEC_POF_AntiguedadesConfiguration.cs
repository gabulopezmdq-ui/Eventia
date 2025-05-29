using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_POF_AntiguedadesConfiguration : IEntityTypeConfiguration<MEC_POF_Antiguedades>
    {
        public void Configure(EntityTypeBuilder<MEC_POF_Antiguedades> builder)
        {
            // Definir la clave primaria
            builder.HasKey(e => e.IdPOFAntig);

            // Configurar la columna IdPOF como un campo generado automáticamente
            builder
               .Property(p => p.IdPOFAntig)
               .ValueGeneratedOnAdd();

            // Definir propiedades de la entidad
            builder.Property(e => e.MesReferencia)
                .IsRequired();

            builder.Property(e => e.AnioReferencia)
                .IsRequired();

            builder.Property(e => e.AnioAntiguedad)
                .IsRequired(false);

            builder.Property(e => e.MesAntiguedad)
                .IsRequired(false);

            // Configurar la relación con la entidad MEC_POF
            builder
                .HasOne(p => p.Persona)
                .WithMany(p => p.POFAntiguedad)
                .HasForeignKey(p => p.IdPersona)
                .IsRequired(true);

            builder
                .Navigation(e => e.Persona)
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
