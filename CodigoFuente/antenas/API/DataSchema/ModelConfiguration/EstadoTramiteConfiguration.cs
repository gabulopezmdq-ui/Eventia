using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class EstadoTramiteConfiguration:IEntityTypeConfiguration<EstadoTramite>
    {
        public void Configure(EntityTypeBuilder<EstadoTramite> builder)
        {
            builder
                .HasKey(k => k.IdEstado);

            builder
                .Property(p => p.Estado)
                .IsRequired(true);
        }
    }
}
