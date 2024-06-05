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
                .Property(p => p.IdAntena)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .HasOne(e => e.TipoAntenas)
                .WithMany(e => e.Antenas)
                .HasForeignKey(e => e.IdTipoAntena)
                .IsRequired(true);

            builder
                .Navigation(e => e.TipoAntenas)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.Prestador)
                .WithMany(e => e.Antenas)
                .HasForeignKey(e => e.IdPrestador)
                .IsRequired(true);

            builder
                .Navigation(e => e.Prestador)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.Expediente)
                .WithOne(e => e.Antenas)
                .HasForeignKey<Expedientes>(e => e.IdExpediente)
                .IsRequired(true);

            builder
                .Navigation(e => e.Expediente)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);
            builder
               .HasMany(e => e.Inspecciones)
               .WithOne(e => e.Antena)
               .HasForeignKey(e => e.IdInspeccion)
               .IsRequired(true);

            builder
                .Navigation(e => e.Prestador)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

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
