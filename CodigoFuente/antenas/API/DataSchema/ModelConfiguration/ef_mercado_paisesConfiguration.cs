using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_mercado_paisesConfiguration : IEntityTypeConfiguration<ef_mercado_paises>
    {
        public void Configure(EntityTypeBuilder<ef_mercado_paises> builder)
        {
            builder.ToTable("ef_mercado_paises");

            builder.HasKey(x => x.id_mercado_pais);

            builder.Property(x => x.id_mercado_pais)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo_mercado)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.id_pais)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            builder.HasIndex(x => new { x.codigo_mercado, x.id_pais })
                   .IsUnique();

            builder.HasIndex(x => new { x.id_pais, x.activo });

           builder.HasOne<ef_mercados>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_mercado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_paises>()
                    .WithMany()
                   .HasForeignKey(x => x.id_pais)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}