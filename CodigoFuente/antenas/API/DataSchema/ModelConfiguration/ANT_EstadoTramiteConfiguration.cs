using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ANT_EstadoTramiteConfiguration:IEntityTypeConfiguration<ANT_EstadoTramites>
    {
        public void Configure(EntityTypeBuilder<ANT_EstadoTramites> builder)
        {
            builder
                .HasKey(k => k.IdEstadoTramite);

            builder
                .Property(k => k.IdEstadoTramite)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Estado)
                .IsRequired(true);

            builder
            .HasMany(e => e.Expedientes)
            .WithOne(e => e.EstadoTramite)
            .HasForeignKey(e => e.IdEstadoTramite);
        }
    }
}
