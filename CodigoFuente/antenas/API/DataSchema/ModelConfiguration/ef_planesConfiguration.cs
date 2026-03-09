using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_planesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_planes>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_planes> builder)
        {
            builder.ToTable("ef_planes", "public");
            builder.HasKey(x => x.id_plan);

            builder.Property(x => x.id_plan).ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.nombre)
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasMaxLength(240);

            builder.Property(x => x.tipo)
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.periodo)
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.config_json)
                .HasColumnType("jsonb");

            builder.Property(x => x.fecha_alta)
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_planes_codigo");
        }
    }
}
