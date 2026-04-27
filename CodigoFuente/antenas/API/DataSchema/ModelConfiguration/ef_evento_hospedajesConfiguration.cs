using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_hospedajesConfiguration : IEntityTypeConfiguration<ef_evento_hospedajes>
    {
        public void Configure(EntityTypeBuilder<ef_evento_hospedajes> builder)
        {
            builder.ToTable("ef_evento_hospedajes", "public");
            builder.HasKey(x => x.id_hospedaje);

            builder.Property(x => x.id_hospedaje).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.nombre).HasMaxLength(150).IsRequired();
            builder.Property(x => x.tipo).HasMaxLength(20);

            builder.Property(x => x.zona).HasMaxLength(120);
            builder.Property(x => x.direccion).HasMaxLength(200);

            builder.Property(x => x.url_externa).HasMaxLength(400);
            builder.Property(x => x.telefono).HasMaxLength(40);
            builder.Property(x => x.whatsapp).HasMaxLength(40);

            builder.Property(x => x.latitud).HasPrecision(9, 6);
            builder.Property(x => x.longitud).HasPrecision(9, 6);

            builder.Property(x => x.id_tramo_referencia);

            builder.Property(x => x.precio_desde).HasPrecision(12, 2);
            builder.Property(x => x.precio_hasta).HasPrecision(12, 2);
            builder.Property(x => x.moneda).HasMaxLength(3);

            // Postgres text[]
            builder.Property(x => x.etiquetas).HasColumnName("etiquetas");

            builder.Property(x => x.nota_publica).HasMaxLength(200);

            builder.Property(x => x.recomendado).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue((short)1);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_evento).HasDatabaseName("ix_hosp_evento");
            builder.HasIndex(x => new { x.id_evento, x.activo }).HasDatabaseName("ix_hosp_evento_activo");
            builder.HasIndex(x => new { x.id_evento, x.orden }).IsUnique().HasDatabaseName("ux_hosp_evento_orden");

            // FKs (si querés navegación)
            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.tramo_referencia)
                   .WithMany()
                   .HasForeignKey(x => x.id_tramo_referencia)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
