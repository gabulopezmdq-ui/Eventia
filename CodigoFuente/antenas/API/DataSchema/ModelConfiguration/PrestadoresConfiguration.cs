using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class PrestadoresConfiguration :IEntityTypeConfiguration<Prestadores>
    {
        public void Configure(EntityTypeBuilder<Prestadores> builder)
        {
            builder
                .HasKey(k => k.IdPrestador);

            builder
                .Property(k => k.IdPrestador)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .HasMany(e => e.Apoderados)
                .WithMany(e => e.Prestador);

            builder
                .Navigation(e => e.Apoderados)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);


            builder
                .Property(p => p.Cuit)
                .IsRequired(true);

            builder
                .Property(p => p.Direccion)
                .IsRequired(true);
            builder
                .Property(p => p.RazonSocial)
                .IsRequired(true);
        }
    }
}
