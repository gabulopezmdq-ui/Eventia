using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_preciosConfiguration : IEntityTypeConfiguration<ef_precios>
    {
        public void Configure(EntityTypeBuilder<ef_precios> builder)
        {
            builder.ToTable("ef_precios");

            builder.HasKey(x => x.id_precio);

            builder.Property(x => x.id_precio)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.objeto_tipo)
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(x => x.codigo_mercado)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.codigo_moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.precio_lista)
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.precio_lanzamiento)
                   .HasColumnType("numeric(12,2)");

            builder.Property(x => x.impuestos_incluidos)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.vigente_desde)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.observaciones)
                   .HasMaxLength(300);

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            builder.HasOne<ef_planes>()
                   .WithMany()
                   .HasForeignKey(x => x.id_plan)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_addons>()
                   .WithMany()
                   .HasForeignKey(x => x.id_addon)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_mercados>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_mercado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_monedas>()
                   .WithMany()
                   .HasForeignKey(x => x.codigo_moneda)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new
            {
                x.id_plan,
                x.codigo_mercado,
                x.codigo_moneda,
                x.activo,
                x.vigente_desde
            });

            builder.HasIndex(x => new
            {
                x.id_addon,
                x.codigo_mercado,
                x.codigo_moneda,
                x.activo,
                x.vigente_desde
            });

            builder.HasIndex(x => new
            {
                x.codigo_mercado,
                x.codigo_moneda,
                x.activo
            });
        }
    }
}