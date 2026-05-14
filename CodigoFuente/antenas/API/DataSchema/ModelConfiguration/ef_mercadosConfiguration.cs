using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_mercadosConfiguration : IEntityTypeConfiguration<ef_mercados>
    {
        public void Configure(EntityTypeBuilder<ef_mercados> builder)
        {
            builder.ToTable("ef_mercados");

            builder.HasKey(x => x.codigo_mercado);

            builder.Property(x => x.codigo_mercado)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.codigo_moneda_default)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.orden)
                   .HasDefaultValue(1)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            builder.HasOne<ef_monedas>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_moneda_default)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}