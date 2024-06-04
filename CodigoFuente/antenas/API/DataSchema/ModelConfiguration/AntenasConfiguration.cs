using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class AntenasConfiguration :IEntityTypeConfiguration<Antenas>
    {
        public void Configure(EntityTypeBuilder<Antenas> builder)
        {
            builder
                .HasKey(k => k.IdAntena);

            builder
                .Property(p => p.IdTipoAntena)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.IdPrestador)
                .IsRequired(true);

            builder
                .Property(p => p.IdEstado)
                .IsRequired(true);

            builder.Property(p => p.IdExpediente)
                .IsRequired(true);

            builder
                .Property(p => p.AlturaSoporte)
                .IsRequired(true);
            builder
                .Property(p => p.AlturaTotal)
                .IsRequired(true);
            builder
                .Property(p => p.CellId)
               
                .IsRequired(true);
            builder
                .Property(p => p.CodigoSitio)
                .IsRequired(true);
            builder
                .Property(p => p.Declarada)
                .IsRequired(true);
            builder
                .Property(p => p.Direccion)
                .IsRequired(true);
            builder
                .Property(p => p.Emplazamiento)
                .IsRequired(true);
            builder
                .Property(p => p.Observaciones)
                .IsRequired(true);
            builder
                .Property(p => p.SalaEquipos)
                .IsRequired(true);
            builder
                .Property(p => p.TipoMimetizado)
                .IsRequired(true);
        }
    }
}
