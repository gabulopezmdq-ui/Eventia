using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_portal_seccionesConfiguration : IEntityTypeConfiguration<ef_param_portal_secciones>
    {
        public void Configure(EntityTypeBuilder<ef_param_portal_secciones> builder)
        {
            builder.ToTable("ef_param_portal_secciones", "public");
            builder.HasKey(x => x.id_portal_seccion);
            builder.Property(x => x.id_portal_seccion).ValueGeneratedOnAdd();
            
            builder.Property(x => x.codigo).HasMaxLength(60).IsRequired();
            builder.Property(x => x.descripcion).HasMaxLength(200);
            builder.Property(x => x.aplica_evento).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.aplica_programa).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.requiere_feature_codigo).HasMaxLength(80);
            builder.Property(x => x.orden_default).IsRequired().HasDefaultValue(1);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo).IsUnique().HasDatabaseName("ux_param_portal_secciones_codigo");
        }
    }
}
