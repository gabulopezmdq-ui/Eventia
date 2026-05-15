using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_medios_pagoConfiguration
        : IEntityTypeConfiguration<ef_param_medios_pago>
    {
        public void Configure(EntityTypeBuilder<ef_param_medios_pago> builder)
        {
            builder.ToTable("ef_param_medios_pago");

            builder.HasKey(x => x.id_medio_pago);

            builder.Property(x => x.id_medio_pago)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(50)
                .IsRequired();

            builder.HasIndex(x => x.codigo)
                .IsUnique();

            builder.Property(x => x.activo)
                .HasDefaultValue(true);

            builder.Property(x => x.permite_referencia)
                .HasDefaultValue(true);

            builder.Property(x => x.es_internacional)
                .HasDefaultValue(false);
        }
    }
}