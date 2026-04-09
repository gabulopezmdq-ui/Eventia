using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_unidadesConfiguration : IEntityTypeConfiguration<ef_cuenta_unidades>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_unidades> builder)
        {
            builder.ToTable("ef_cuenta_unidades", "public");

            builder.HasKey(x => x.id_unidad);

            builder.Property(x => x.id_unidad)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cuenta)
                   .IsRequired();

            builder.Property(x => x.codigo)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.descripcion)
                   .HasMaxLength(500);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.id_cuenta, x.codigo })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_cuenta_unidades_cuenta_codigo");

            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_ef_cuenta_unidades_cuenta");
        }
    }
}
