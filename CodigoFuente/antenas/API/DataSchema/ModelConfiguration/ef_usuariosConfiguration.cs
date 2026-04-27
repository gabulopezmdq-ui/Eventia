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

            builder.Property(x => x.auth_provider)
                   .HasMaxLength(20)
                   .IsRequired()
                   .HasDefaultValue("local");

            builder.Property(x => x.google_sub)
                   .HasMaxLength(50);

            builder.Property(x => x.avatar_url)
                   .HasMaxLength(500);

            // NUEVOS CAMPOS
            builder.Property(x => x.telefono)
                   .HasMaxLength(50);

            builder.Property(x => x.id_pais);

            builder.Property(x => x.id_idioma_preferido);

            builder.Property(x => x.id_idioma_default_evento);

            builder.Property(x => x.recibir_novedades)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.ultimo_login);

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

            builder.HasIndex(x => x.id_pais)
                  .HasDatabaseName("ix_ef_usuarios_id_pais");

            builder.HasIndex(x => x.id_idioma_preferido)
                   .HasDatabaseName("ix_ef_usuarios_id_idioma_preferido");

            builder.HasIndex(x => x.id_idioma_default_evento)
                   .HasDatabaseName("ix_ef_usuarios_id_idioma_default_evento");

            builder.HasOne(x => x.pais)
                   .WithMany()
                   .HasForeignKey(x => x.id_pais)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.idioma_preferido)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma_preferido)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.idioma_default_evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma_default_evento)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
