using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_regalos_fondo_metasConfiguration : IEntityTypeConfiguration<ef_evento_regalos_fondo_metas>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_fondo_metas> builder)
        {
            builder.ToTable("ef_evento_regalos_fondo_metas");

            builder.HasKey(x => x.id_meta);
            builder.Property(x => x.id_meta).ValueGeneratedOnAdd();

            builder.Property(x => x.tipo_meta).HasMaxLength(20).HasDefaultValue("GENERICA").IsRequired();
            builder.Property(x => x.titulo).HasMaxLength(120).IsRequired();
            builder.Property(x => x.descripcion).HasMaxLength(300);

            builder.Property(x => x.objetivo_monto).HasColumnType("numeric(12,2)").IsRequired();

            builder.Property(x => x.url_referencia).HasMaxLength(700);
            builder.Property(x => x.imagen_url).HasMaxLength(700);

            builder.Property(x => x.orden).HasDefaultValue((short)1).IsRequired();
            builder.Property(x => x.visible).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.fecha_alta).IsRequired();

            builder.HasIndex(x => new { x.id_fondo, x.orden }).HasDatabaseName("ix_ef_evento_regalos_fondo_metas_fondo");
            builder.HasIndex(x => new { x.id_evento, x.visible, x.activo }).HasDatabaseName("ix_ef_evento_regalos_fondo_metas_visibles");

            builder.HasOne(x => x.ef_evento_regalos_fondos)
                   .WithMany()
                   .HasForeignKey(x => x.id_fondo)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}