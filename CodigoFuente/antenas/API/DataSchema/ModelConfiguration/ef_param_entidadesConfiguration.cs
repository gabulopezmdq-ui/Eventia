using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_entidadesConfiguration : IEntityTypeConfiguration<ef_param_entidades>
    {
        public void Configure(EntityTypeBuilder<ef_param_entidades> builder)
        {
            builder.ToTable("ef_param_entidades");
            builder.HasKey(x => x.entidad);

            builder.Property(x => x.entidad).HasMaxLength(30).IsRequired();
            builder.Property(x => x.descripcion).HasMaxLength(100).IsRequired();
            builder.Property(x => x.grupo_menu).HasMaxLength(50).IsRequired();

            builder.Property(x => x.fallback_locale).HasMaxLength(10).IsRequired();
            builder.Property(x => x.max_len_texto).HasDefaultValue((short)120).IsRequired();

            builder.Property(x => x.requiere_traducciones).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.requiere_es_ar).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.requiere_todos_idiomas).HasDefaultValue(false).IsRequired();
            builder.Property(x => x.usa_orden).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.editable_por_superadmin).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.ayuda_ui).HasMaxLength(300);

            builder.HasIndex(x => x.descripcion).IsUnique().HasDatabaseName("ux_ef_param_entidades_descripcion");
            builder.HasIndex(x => new { x.activo, x.grupo_menu, x.orden_menu }).HasDatabaseName("ix_ef_param_entidades_activo_orden");
        }
    }
}
