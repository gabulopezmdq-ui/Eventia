using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuentasConfiguration : IEntityTypeConfiguration<ef_cuentas>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_cuentas> builder)
        {
            builder.ToTable("ef_cuentas", "public");

            builder.HasKey(x => x.id_cuenta);

            builder.Property(x => x.id_cuenta)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.nombre_cuenta)
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(x => x.tipo)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.nombre_cuenta)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_cuentas_nombre");
        }
    }
}
