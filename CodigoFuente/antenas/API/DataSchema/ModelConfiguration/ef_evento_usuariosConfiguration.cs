using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_usuariosConfiguration : IEntityTypeConfiguration<ef_evento_usuarios>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_evento_usuarios> builder)
        {
            builder.ToTable("ef_evento_usuarios", "public");

            builder.HasKey(x => x.id_evento_usuario);

            builder.Property(x => x.id_evento_usuario)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            // Relaciones
            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento);

            builder.HasOne(x => x.usuario)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario);

            builder.HasOne(x => x.rol)
                   .WithMany()
                   .HasForeignKey(x => x.id_rol);

            // Índice único lógico
            builder.HasIndex(x => new { x.id_evento, x.id_usuario, x.id_rol })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_usuarios_evento_usuario_rol");
        }
    }
}
