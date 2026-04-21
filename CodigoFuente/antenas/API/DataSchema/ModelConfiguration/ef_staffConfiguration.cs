using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_staffConfiguration : IEntityTypeConfiguration<ef_staff>
    {
        public void Configure(EntityTypeBuilder<ef_staff> builder)
        {
            builder.ToTable("ef_staff");

            builder.HasKey(x => x.id_staff);

            builder.Property(x => x.id_staff)
                   .ValueGeneratedOnAdd();

            // Código alfanumérico único (sin guiones, 10 caracteres)
            builder.Property(x => x.codigo)
                   .HasMaxLength(12)
                   .IsRequired();

            builder.HasIndex(x => x.codigo)
                   .IsUnique();

            // Datos personales registrados por el Admin
            builder.Property(x => x.nombre)
                   .HasMaxLength(100);

            builder.Property(x => x.apellido)
                   .HasMaxLength(100);

            builder.Property(x => x.email)
                   .HasMaxLength(200);

            builder.Property(x => x.telefono)
                   .HasMaxLength(50);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            // FK: ef_cuentas
            builder.HasOne(x => x.ef_cuentas)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

            // FK: ef_roles
            builder.HasOne(x => x.ef_roles)
                   .WithMany()
                   .HasForeignKey(x => x.id_rol)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
