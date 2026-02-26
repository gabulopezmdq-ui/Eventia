using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_restricciones_alimentariasConfiguration : IEntityTypeConfiguration<ef_param_restricciones_alimentarias>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_param_restricciones_alimentarias> builder)
        {
            builder.ToTable("ef_param_restricciones_alimentarias", "public");

            builder.HasKey(x => x.id_restriccion_alim)
                   .HasName("ef_param_restricciones_alimentarias_pkey");

            builder.Property(x => x.id_restriccion_alim)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(40)
                   .IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.orden)
                   .HasDefaultValue(0)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.es_alergia)
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(x => x.severidad)
                   .HasDefaultValue((short)1)
                   .IsRequired();

            builder.Property(x => x.requiere_alerta)
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(x => x.etiqueta_corta)
                   .HasMaxLength(20);

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_restr_codigo");

            builder.HasIndex(x => new { x.activo, x.orden })
                   .HasDatabaseName("ix_restr_activo_orden");

            builder.HasCheckConstraint(
                "ck_restr_severidad",
                "severidad between 1 and 5");
        }
    }
}
