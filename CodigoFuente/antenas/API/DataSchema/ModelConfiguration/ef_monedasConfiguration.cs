using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_monedasConfiguration : IEntityTypeConfiguration<ef_monedas>
    {
        public void Configure(EntityTypeBuilder<ef_monedas> builder)
        {
            builder.ToTable("ef_monedas");

            builder.HasKey(x => x.codigo_moneda);

            builder.Property(x => x.codigo_moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.simbolo)
                   .HasMaxLength(5);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.orden)
                   .HasDefaultValue(1)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();
        }
    }
}