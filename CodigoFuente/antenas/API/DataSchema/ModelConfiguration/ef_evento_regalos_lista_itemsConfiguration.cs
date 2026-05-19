using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_regalos_lista_itemsConfiguration : IEntityTypeConfiguration<ef_evento_regalos_lista_items>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_lista_items> builder)
        {
            builder.ToTable("ef_evento_regalos_lista_items");

            builder.HasKey(x => x.id_regalo_item);

            builder.Property(x => x.id_regalo_item).ValueGeneratedOnAdd();

            builder.Property(x => x.titulo).HasMaxLength(140).IsRequired();
            builder.Property(x => x.descripcion).HasMaxLength(300);

            builder.Property(x => x.cantidad_total).HasDefaultValue(1).IsRequired();
            builder.Property(x => x.permitir_excedente).HasDefaultValue(false).IsRequired();

            builder.Property(x => x.url_referencia).HasMaxLength(700);
            builder.Property(x => x.imagen_url).HasMaxLength(700);

            builder.Property(x => x.orden).HasDefaultValue((short)1).IsRequired();
            builder.Property(x => x.visible).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.fecha_alta).IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.orden }).HasDatabaseName("ix_ef_regalos_lista_items_evento");
            builder.HasIndex(x => new { x.id_evento, x.visible, x.activo }).HasDatabaseName("ix_ef_regalos_lista_items_visibles");

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}