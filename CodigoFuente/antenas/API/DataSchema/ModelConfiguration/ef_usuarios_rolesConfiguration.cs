using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_usuarios_rolesConfiguration : IEntityTypeConfiguration<ef_usuarios_roles>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_usuarios_roles> builder)
        {
            builder.ToTable("ef_usuarios_roles");

            builder.HasKey(x => x.id_usuario_rol);

            builder.Property(x => x.id_usuario_rol)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_usuario)
                   .IsRequired();

            builder.Property(x => x.id_rol)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.HasIndex(x => new { x.id_usuario, x.id_rol })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_usuario_roles_usuario_rol");

            builder.HasIndex(x => x.id_usuario_rol)
                   .HasDatabaseName("ix_ef_usuario_roles_activo_true")
                   .HasFilter("activo = true");

        }
    }
}
