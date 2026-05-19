using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration.Regalos
{
    public class ef_evento_regalos_transferencias_configConfiguration : IEntityTypeConfiguration<ef_evento_regalos_transferencias_config>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_transferencias_config> builder)
        {
            builder.ToTable("ef_evento_regalos_transferencias_config");

            builder.HasKey(x => x.id_evento);

            builder.Property(x => x.titulo)
                   .HasMaxLength(120)
                   .HasDefaultValue("Regalos")
                   .IsRequired();

            builder.Property(x => x.texto_intro)
                   .HasMaxLength(500);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta).IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_ef_regalos_transf_cfg_evento");

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}