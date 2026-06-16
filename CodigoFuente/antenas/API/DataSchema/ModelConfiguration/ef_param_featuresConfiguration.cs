using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_featuresConfiguration : IEntityTypeConfiguration<ef_param_features>
    {
        public void Configure(EntityTypeBuilder<ef_param_features> builder)
        {
            builder.ToTable("ef_param_features");

            builder.HasKey(x => x.id_feature);

            builder.Property(x => x.id_feature)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(x => x.nombre)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasMaxLength(500);

            builder.Property(x => x.categoria)
                .HasMaxLength(50);

            builder.Property(x => x.scope_default)
                .HasMaxLength(10)
                .HasDefaultValue("EVENTO")
                .IsRequired();

            builder.Property(x => x.fase_sugerida)
                .HasDefaultValue((short)2)
                .IsRequired();

            builder.Property(x => x.monetizable)
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasDefaultValue(true)
                .IsRequired();

            // ==========================
            // NUEVOS CAMPOS JERARQUÍA
            // ==========================

            builder.Property(x => x.id_feature_padre)
                .HasColumnName("id_feature_padre");

            builder.Property(x => x.es_feature_padre)
                .HasColumnName("es_feature_padre")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.es_configurable_usuario)
                .HasColumnName("es_configurable_usuario")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.orden_categoria)
                .HasColumnName("orden_categoria");

            builder.Property(x => x.orden_feature)
                .HasColumnName("orden_feature");

            // ==========================
            // VISIBILIDAD DEFAULT
            // ==========================

            builder.Property(x => x.visible_acceso_evento_default)
                .HasColumnName("visible_acceso_evento_default")
                .IsRequired();

            builder.Property(x => x.visible_centro_evento_default)
                .HasColumnName("visible_centro_evento_default")
                .IsRequired();

            builder.Property(x => x.visible_acceso_programa_default)
                .HasColumnName("visible_acceso_programa_default")
                .IsRequired();

            builder.Property(x => x.visible_centro_programa_default)
                .HasColumnName("visible_centro_programa_default")
                .IsRequired();

            builder.Property(x => x.aplica_evento)
                .HasColumnName("aplica_evento")
                .IsRequired();

            builder.Property(x => x.aplica_programa)
                .HasColumnName("aplica_programa")
                .IsRequired();

            builder.Property(x => x.config_json)
                .HasColumnType("jsonb");

            // ==========================
            // ÍNDICES
            // ==========================

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_param_features_codigo");

            builder.HasIndex(x => x.id_feature)
                .HasDatabaseName("ix_ef_param_features_activo_true")
                .HasFilter("activo = true");

            builder.HasIndex(x => x.id_feature_padre)
                .HasDatabaseName("ix_ef_param_features_padre");
        }
    }
}