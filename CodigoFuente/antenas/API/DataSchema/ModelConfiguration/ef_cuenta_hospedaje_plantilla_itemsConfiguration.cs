using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuenta_hospedaje_plantilla_itemsConfiguration : IEntityTypeConfiguration<ef_cuenta_hospedaje_plantilla_items>
    {
        public void Configure(EntityTypeBuilder<ef_cuenta_hospedaje_plantilla_items> builder)
        {
            builder.ToTable("ef_cuenta_hospedaje_plantilla_items", "public");
            builder.HasKey(x => x.id_hospedaje_plantilla_item);

            builder.Property(x => x.id_hospedaje_plantilla_item).ValueGeneratedOnAdd();
            builder.Property(x => x.id_hospedaje_plantilla).IsRequired();

            builder.Property(x => x.nombre).HasMaxLength(150).IsRequired();
            builder.Property(x => x.tipo).HasMaxLength(20);

            builder.Property(x => x.zona).HasMaxLength(120);
            builder.Property(x => x.direccion).HasMaxLength(200);

            builder.Property(x => x.url_externa).HasMaxLength(400);
            builder.Property(x => x.telefono).HasMaxLength(40);
            builder.Property(x => x.whatsapp).HasMaxLength(40);

            builder.Property(x => x.latitud).HasColumnType("numeric(9,6)");
            builder.Property(x => x.longitud).HasColumnType("numeric(9,6)");

            builder.Property(x => x.etiquetas).HasColumnType("text[]").HasDefaultValueSql("'{}'::text[]");
            builder.Property(x => x.nota_publica).HasMaxLength(200);

            builder.Property(x => x.recomendado).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue((short)1);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.bloque)
                   .WithOne(b => b.item)
                   .HasForeignKey<ef_cuenta_hospedaje_plantilla_item_bloques>(b => b.id_hospedaje_plantilla_item)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.id_hospedaje_plantilla).HasDatabaseName("ix_chpi_plantilla");
        }
    }
}
