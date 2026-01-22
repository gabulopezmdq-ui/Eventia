using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_usuariosConfiguration : IEntityTypeConfiguration<ef_cuenta_usuarios>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_cuenta_usuarios> builder)
        {
            builder.ToTable("ef_cuenta_usuarios", "public");

            builder.HasKey(x => x.id_cuenta_usuario);

            builder.Property(x => x.id_cuenta_usuario)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cuenta)
                   .IsRequired();

            builder.Property(x => x.id_usuario)
                   .IsRequired();

            builder.Property(x => x.id_rol)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            // Unicidad lógica: una combinación no se repite
            builder.HasIndex(x => new { x.id_cuenta, x.id_usuario, x.id_rol })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_cuenta_usuarios_cuenta_usuario_rol");

            // Relaciones
            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.rol)
                   .WithMany()
                   .HasForeignKey(x => x.id_rol)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
