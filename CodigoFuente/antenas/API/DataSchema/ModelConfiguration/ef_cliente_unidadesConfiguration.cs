using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cliente_unidadesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_cliente_unidades>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_cliente_unidades> builder)
        {
            builder.ToTable("ef_cliente_unidades", "public");

            builder.HasKey(x => x.id_cliente_unidad);

            builder.Property(x => x.id_cliente_unidad)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cliente)
                   .IsRequired();

            builder.Property(x => x.id_unidad)
                   .IsRequired();

            builder.Property(x => x.es_principal)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_cliente, x.id_unidad })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_cliente_unidades_cliente_unidad");

            builder.HasIndex(x => x.id_cliente)
                   .HasDatabaseName("ix_ef_cliente_unidades_cliente");

            builder.HasIndex(x => x.id_unidad)
                   .HasDatabaseName("ix_ef_cliente_unidades_unidad");

            builder.HasOne(x => x.cliente)
                   .WithMany()
                   .HasForeignKey(x => x.id_cliente)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.unidad)
                   .WithMany()
                   .HasForeignKey(x => x.id_unidad)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
