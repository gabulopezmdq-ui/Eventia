using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ApoderadoXPrestadorConfiguration:IEntityTypeConfiguration<ApoderadoXPrestador>
    {
        public void Configure(EntityTypeBuilder<ApoderadoXPrestador>builder)
        {
            builder
                .HasKey(k => k.IdApoderadoXprestador);

            builder
                .Property(k => k.IdApoderadoXprestador)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .HasMany(e => e.Apoderados)
                .WithMany(e => e.ApoderadoXPrestadores);

            builder
                .Navigation(e => e.Apoderados)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .HasMany(e => e.Prestadores)
                .WithMany(e => e.ApoderadoXPrestadores);

            builder
                .Navigation(e => e.Prestadores)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .HasMany(e => e.Usuarios)
                .WithMany(e => e.ApoderadoXPrestadores);

            builder
                .Navigation(e => e.Usuarios)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .Property(p => p.Fecha)
                .IsRequired(true);
        }
    }
}
