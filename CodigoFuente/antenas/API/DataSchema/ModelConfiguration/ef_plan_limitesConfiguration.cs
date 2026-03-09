using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_plan_limitesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_plan_limites>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_plan_limites> builder)
        {
            builder.ToTable("ef_plan_limites", "public");

            builder.HasKey(x => x.id_plan_limite);

            builder.Property(x => x.id_plan_limite)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_plan)
                   .IsRequired();

            builder.Property(x => x.codigo_limite)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.valor_json)
                   .HasColumnType("jsonb");

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasIndex(x => new { x.id_plan, x.codigo_limite })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_plan_limites_plan_codigo");

            builder.HasIndex(x => x.id_plan)
                   .HasDatabaseName("ix_ef_plan_limites_plan");
        }
    }
}
