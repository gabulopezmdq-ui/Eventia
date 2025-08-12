using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_POF_BarrasConfiguration : IEntityTypeConfiguration<MEC_POF_Barras>
    {
        public void Configure(EntityTypeBuilder<MEC_POF_Barras> builder)
        {
            // Definir la clave primaria
            builder.HasKey(e => e.IdPOFBarra);

            // Configurar la columna IdPOF como un campo generado automáticamente
            builder
               .Property(p => p.IdPOFBarra)
               .ValueGeneratedOnAdd();

            // Definir propiedades de la entidad
            builder.Property(e => e.Barra)
                .IsRequired();

            // Definir propiedades de la entidad
            builder.Property(e => e.Vigente)
                .IsRequired();

            // Configurar la relación con la entidad MEC_POF
            builder
                .HasOne(p => p.POF)
                .WithMany(p => p.POFBarras)
                .HasForeignKey(p => p.IdPOF)
                .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }
}
