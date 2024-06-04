using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class LeyendaConfiguration:IEntityTypeConfiguration<Leyenda>
    {
        public void Configure(EntityTypeBuilder<Leyenda> builder)
        {
            builder
                .HasKey(k => k.IdLeyenda);

            builder
                .Property(p => p.Nombre)
                .IsRequired(true);
        }
    }
}
