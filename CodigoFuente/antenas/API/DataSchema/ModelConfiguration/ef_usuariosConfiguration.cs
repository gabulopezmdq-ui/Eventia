using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.Configurations
{
    public class ef_usuariosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_usuarios>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_usuarios> builder)
        {
            builder.ToTable("ef_usuarios", "public");

            builder.HasKey(x => x.id_usuario);

            builder.Property(x => x.id_usuario)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.email)
                   .HasMaxLength(320)
                   .IsRequired();

            builder.Property(x => x.password_hash)
                   .HasMaxLength(255); // nullable => sin IsRequired

            builder.Property(x => x.nombre)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.apellido)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.email_verificado)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            // Nuevos
            builder.Property(x => x.auth_provider)
                   .HasMaxLength(20)
                   .IsRequired()
                   .HasDefaultValue("local");

            builder.Property(x => x.google_sub)
                   .HasMaxLength(50);

            builder.Property(x => x.avatar_url)
                   .HasMaxLength(500);

            builder.HasIndex(x => x.email)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_usuarios_email");

            builder.HasIndex(x => x.google_sub)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_usuarios_google_sub")
                   .HasFilter("google_sub is not null");

            builder.HasIndex(x => x.id_usuario)
                   .HasDatabaseName("ix_ef_usuarios_activo_true")
                   .HasFilter("activo = true");
        }
    }
}
