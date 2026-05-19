using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_usuario_invitacionesConfiguration : IEntityTypeConfiguration<ef_cuenta_usuario_invitaciones>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_usuario_invitaciones> builder)
        {
            builder.ToTable("ef_cuenta_usuario_invitaciones", "public");

            builder.HasKey(x => x.id_cuenta_usuario_invitacion);

            builder.Property(x => x.id_cuenta_usuario_invitacion)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cuenta)
                   .IsRequired();

            builder.Property(x => x.email_invitado)
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(x => x.id_rol)
                   .IsRequired();

            builder.Property(x => x.token)
                   .HasMaxLength(64)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .HasDefaultValue("P");

            builder.Property(x => x.fecha_expiracion);

            builder.Property(x => x.fecha_aceptacion);

            builder.Property(x => x.id_usuario_invita)
                   .IsRequired();

            builder.Property(x => x.id_usuario_acepta);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.token)
                   .IsUnique()
                   .HasDatabaseName("ux_cui_token");

            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_cui_cuenta");

            builder.HasIndex(x => new { x.estado, x.activo })
                   .HasDatabaseName("ix_cui_estado_activo");

            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.rol)
                   .WithMany()
                   .HasForeignKey(x => x.id_rol)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario_invita)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_invita)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario_acepta)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_acepta)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}