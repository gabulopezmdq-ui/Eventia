using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ApoderadoXPrestadorConfiguration:IEntityTypeConfiguration<ApoderadoXPrestador>
    {
        public void Configure(EntityTypeBuilder<ApoderadoXPrestador>builder)
        {
            builder.HasKey(k => k.IdApoderadoXprestador);

            builder
                .Property(p => p.IdApoderado)
                .IsRequired(true);

            builder
                .Property(p => p.IdPrestador)
                .IsRequired(true);

            builder
                .Property(p => p.IdUsuario)
                .IsRequired(true);

            builder
                .Property(p => p.Fecha)
                .IsRequired(true);
        }
    }
}
