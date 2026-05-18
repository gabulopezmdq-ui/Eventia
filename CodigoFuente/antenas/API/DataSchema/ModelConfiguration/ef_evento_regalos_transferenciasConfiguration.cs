using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration.Regalos
{
    public class ef_evento_regalos_transferenciasConfiguration : IEntityTypeConfiguration<ef_evento_regalos_transferencias>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_transferencias> builder)
        {
            builder.ToTable("ef_evento_regalos_transferencias");

            builder.HasKey(x => x.id_evento_regalo_transferencia);
            builder.Property(x => x.id_evento_regalo_transferencia).ValueGeneratedOnAdd();

            builder.Property(x => x.codigo_moneda)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.titulo)
                   .HasMaxLength(60);

            builder.Property(x => x.datos_transferencia_texto)
                   .HasMaxLength(700)
                   .IsRequired();

            builder.Property(x => x.instrucciones)
                   .HasMaxLength(500);

            builder.Property(x => x.orden)
                   .HasDefaultValue((short)1)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta).IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.activo, x.orden })
                   .HasDatabaseName("ix_ef_regalos_transf_evento");

            builder.HasIndex(x => new { x.id_evento, x.codigo_moneda, x.activo })
                   .HasDatabaseName("ix_ef_regalos_transf_moneda");

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_monedas)
                   .WithMany()
                   .HasForeignKey(x => x.codigo_moneda)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}