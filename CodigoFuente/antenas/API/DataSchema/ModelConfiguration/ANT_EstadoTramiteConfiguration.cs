using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class EstadoTramiteConfiguration:IEntityTypeConfiguration<ANT_EstadoTramite>
    {
        public void Configure(EntityTypeBuilder<ANT_EstadoTramite> builder)
        {
            builder
                .HasKey(k => k.IdEstado);


            builder
                .HasMany(p => p.Expedientes)
                .WithOne(e => e.EstadoTramite)
                .HasForeignKey(e => e.IdExpediente);

            builder
                .Property(k => k.IdEstado)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Estado)
                .IsRequired(true);

        }
    }
}
