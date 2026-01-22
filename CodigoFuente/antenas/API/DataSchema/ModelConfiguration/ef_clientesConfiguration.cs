using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_clientesConfiguration : IEntityTypeConfiguration<ef_clientes>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_clientes> builder)
        {
            builder.ToTable("ef_clientes", "public");

            builder.HasKey(x => x.id_cliente);

            builder.Property(x => x.id_cliente)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cuenta)
                   .IsRequired();

            builder.Property(x => x.nombre_cliente)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.email)
                   .HasMaxLength(200);

            builder.Property(x => x.telefono)
                   .HasMaxLength(50);

            builder.Property(x => x.notas)
                   .HasMaxLength(500);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            // Índices
            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_ef_clientes_id_cuenta");

            builder.HasIndex(x => x.id_cliente)
                   .HasDatabaseName("ix_ef_clientes_activo_true")
                   .HasFilter("activo = true");

            // FK a ef_cuentas
            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
