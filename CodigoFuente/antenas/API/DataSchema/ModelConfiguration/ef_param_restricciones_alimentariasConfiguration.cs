using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_restricciones_alimentariasConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_param_restricciones_alimentarias>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_restricciones_alimentarias> builder)
        {
            builder.ToTable("ef_param_restricciones_alimentarias", "public");

            builder.HasKey(x => x.id_restriccion_alim)
                   .HasName("ef_param_restricciones_alimentarias_pkey");

            builder.Property(x => x.id_restriccion_alim)
                   .HasColumnName("id_restriccion_alim")
                   .ValueGeneratedOnAdd(); // identity

            builder.Property(x => x.codigo)
                   .HasColumnName("codigo")
                   .HasMaxLength(40)
                   .IsRequired();

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_param_restriccion_codigo");

            builder.Property(x => x.activo)
                   .HasColumnName("activo")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.orden)
                   .HasColumnName("orden")
                   .HasDefaultValue(1)
                   .IsRequired();

            builder.Property(x => x.categoria)
                   .HasColumnName("categoria")
                   .HasMaxLength(20)
                   .HasDefaultValue("OTRA")
                   .IsRequired();

            builder.Property(x => x.icon_key)
                   .HasColumnName("icon_key")
                   .HasMaxLength(30)
                   .HasDefaultValue("GENERIC")
                   .IsRequired();

            builder.Property(x => x.requiere_alerta_visual)
                   .HasColumnName("requiere_alerta_visual")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.requiere_confirmacion_organizador)
                   .HasColumnName("requiere_confirmacion_organizador")
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(x => x.es_alergeno)
                   .HasColumnName("es_alergeno")
                   .HasDefaultValue(false)
                   .IsRequired();

            // Índices (ojo: en DB se llaman así; acá EF crea/usa el nombre en migraciones)
            builder.HasIndex(x => new { x.activo, x.orden })
                   .HasDatabaseName("ix_restr_activo_orden");

            builder.HasIndex(x => x.activo)
                   .HasDatabaseName("ix_ef_param_restriccion_activo");

            // CHECK constraints (EF Core 8 soporta HasCheckConstraint)
            builder.HasCheckConstraint("ck_ef_param_restriccion_orden", "orden >= 1");

            builder.HasCheckConstraint(
                "ck_restr_categoria",
                "categoria IN ('ALERGIA','INTOLERANCIA','ELECCION','RELIGIOSO','OTRA')"
            );
        }
    }
}
