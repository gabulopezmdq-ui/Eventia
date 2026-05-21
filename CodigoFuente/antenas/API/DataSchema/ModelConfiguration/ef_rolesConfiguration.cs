using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_rolesConfiguration : IEntityTypeConfiguration<ef_roles>
    {
        public void Configure(EntityTypeBuilder<ef_roles> builder)
        {
            builder.ToTable("ef_roles", "public");

            builder.HasKey(x => x.id_rol);

            builder.Property(x => x.id_rol)
                .HasColumnName("id_rol")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasColumnName("codigo")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasColumnName("descripcion")
                .HasMaxLength(300);

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.categoria)
                .HasColumnName("categoria")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.aplica_tipo_operacion)
                .HasColumnName("aplica_tipo_operacion")
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.asignable_equipo_evento)
                .HasColumnName("asignable_equipo_evento")
                .IsRequired();

            builder.Property(x => x.asignable_staff_operativo)
                .HasColumnName("asignable_staff_operativo")
                .IsRequired();

            builder.Property(x => x.requiere_usuario)
                .HasColumnName("requiere_usuario")
                .IsRequired();

            builder.Property(x => x.permite_codigo_staff)
                .HasColumnName("permite_codigo_staff")
                .IsRequired();

            builder.Property(x => x.orden_ui)
                .HasColumnName("orden_ui")
                .IsRequired();

            builder.Property(x => x.pantalla_inicio)
                .HasColumnName("pantalla_inicio")
                .HasMaxLength(80);
        }
    }
}
