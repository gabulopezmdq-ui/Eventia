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
                .Property(p => p.IdApoderado)
                .IsRequired(true);

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
