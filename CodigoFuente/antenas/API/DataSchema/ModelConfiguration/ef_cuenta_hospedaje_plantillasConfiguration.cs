using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_hospedaje_plantillasConfiguration : IEntityTypeConfiguration<ef_cuenta_hospedaje_plantillas>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_hospedaje_plantillas> builder)
        {
            builder.ToTable("ef_cuenta_hospedaje_plantillas", "public");
            builder.HasKey(x => x.id_hospedaje_plantilla);

            builder.Property(x => x.id_hospedaje_plantilla).ValueGeneratedOnAdd();
            builder.Property(x => x.id_cuenta).IsRequired();

            builder.Property(x => x.id_unidad);

            builder.Property(x => x.codigo).HasMaxLength(30);
            builder.Property(x => x.nombre).HasMaxLength(120).IsRequired();
            builder.Property(x => x.descripcion).HasMaxLength(300);

            builder.Property(x => x.ciudad).HasMaxLength(100);
            builder.Property(x => x.zona).HasMaxLength(120);

            builder.Property(x => x.id_pais);

            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasMany(x => x.items)
                   .WithOne(i => i.plantilla)
                   .HasForeignKey(i => i.id_hospedaje_plantilla)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.id_cuenta).HasDatabaseName("ix_chp_cuenta");
            builder.HasIndex(x => x.id_unidad).HasDatabaseName("ix_chp_unidad");
        }
    }
}