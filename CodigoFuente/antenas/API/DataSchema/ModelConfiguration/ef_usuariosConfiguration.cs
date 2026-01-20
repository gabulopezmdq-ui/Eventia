using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_usuariosConfiguration : IEntityTypeConfiguration<ef_usuarios>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_usuarios> builder)
        {
            builder.ToTable("ef_usuarios");
              
            builder.HasKey(x => x.id_usuario);

            builder.Property(x => x.id_usuario)
                   .ValueGeneratedOnAdd();
              
            builder.Property(x => x.email)
                    .HasMaxLength(320)
                    .IsRequired();

            builder.Property(x => x.password_hash)
                    .HasMaxLength(255)
                    .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.apellido)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.email_verificado)
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.email)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_usuarios_email");

            builder.HasIndex(x => x.id_usuario)
                   .HasDatabaseName("ix_ef_usuarios_activo_true")
                   .HasFilter("activo = true");

        }
    }
}
