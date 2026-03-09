using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_addonsConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_addons>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_addons> builder)
        {
            builder.ToTable("ef_addons", "public");
            builder.HasKey(x => x.id_addon);

            builder.Property(x => x.id_addon).ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.nombre)
                .HasMaxLength(90)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasMaxLength(240);

            builder.Property(x => x.scope)
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.config_json_default)
                .HasColumnType("jsonb");

            builder.Property(x => x.fecha_alta)
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_addons_codigo");
        }
    }
}
