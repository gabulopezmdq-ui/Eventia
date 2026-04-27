using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_hospedaje_plantilla_item_bloquesConfiguration : IEntityTypeConfiguration<ef_cuenta_hospedaje_plantilla_item_bloques>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_hospedaje_plantilla_item_bloques> builder)
        {
            builder.ToTable("ef_cuenta_hospedaje_plantilla_item_bloques", "public");
            builder.HasKey(x => x.id_bloque);

            builder.Property(x => x.id_bloque).ValueGeneratedOnAdd();
            builder.Property(x => x.id_hospedaje_plantilla_item).IsRequired();

            builder.Property(x => x.nombre_reserva).HasMaxLength(120);
            builder.Property(x => x.codigo_promocional).HasMaxLength(60);
            builder.Property(x => x.condiciones).HasMaxLength(240);
            builder.Property(x => x.url_bloque).HasMaxLength(400);

            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_hospedaje_plantilla_item).HasDatabaseName("ix_chpib_item");
        }
    }
}
