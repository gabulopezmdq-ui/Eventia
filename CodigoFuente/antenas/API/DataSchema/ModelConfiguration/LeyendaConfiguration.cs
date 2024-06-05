using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class LeyendaConfiguration:IEntityTypeConfiguration<Leyendas>
    {
        public void Configure(EntityTypeBuilder<Leyendas> builder)
        {
            builder
                .HasKey(k => k.IdLeyenda);

            builder
                .Property(k => k.IdLeyenda)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.Nombre)
                .IsRequired(true);
        }
    }
}
