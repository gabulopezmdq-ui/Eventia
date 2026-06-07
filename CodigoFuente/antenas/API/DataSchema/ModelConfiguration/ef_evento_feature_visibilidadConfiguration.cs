using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_feature_visibilidadConfiguration : IEntityTypeConfiguration<ef_evento_feature_visibilidad>
    {
        public void Configure(EntityTypeBuilder<ef_evento_feature_visibilidad> builder)
        {
            builder.ToTable("ef_evento_feature_visibilidad");

            builder.HasKey(x => x.id_evento_feature_visibilidad);

            builder.Property(x => x.id_evento_feature_visibilidad).HasColumnName("id_evento_feature_visibilidad");
            builder.Property(x => x.id_evento).HasColumnName("id_evento").IsRequired();
            builder.Property(x => x.id_feature).HasColumnName("id_feature").IsRequired();

            builder.Property(x => x.visible_acceso_evento).HasColumnName("visible_acceso_evento");
            builder.Property(x => x.visible_centro_evento).HasColumnName("visible_centro_evento");
            builder.Property(x => x.visible_acceso_programa).HasColumnName("visible_acceso_programa");
            builder.Property(x => x.visible_centro_programa).HasColumnName("visible_centro_programa");

            builder.Property(x => x.fecha_alta).HasColumnName("fecha_alta").IsRequired();
            builder.Property(x => x.fecha_modif).HasColumnName("fecha_modif");

            builder.HasIndex(x => new { x.id_evento, x.id_feature })
                .IsUnique()
                .HasDatabaseName("ux_evento_feature_visibilidad");
        }
    }
}