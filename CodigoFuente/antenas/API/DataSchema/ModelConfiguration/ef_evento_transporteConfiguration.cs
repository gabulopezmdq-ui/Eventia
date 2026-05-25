using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_transporteConfiguration : IEntityTypeConfiguration<ef_evento_transporte>
    {
        public void Configure(EntityTypeBuilder<ef_evento_transporte> builder)
        {
            builder.ToTable("ef_evento_transporte", "public");

            builder.HasKey(x => x.id_evento)
                   .HasName("pk_ef_evento_transporte");

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.info_publica)
                   .HasMaxLength(800);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .IsRequired();

            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.activo)
                   .HasDatabaseName("ix_ef_evento_transporte_activo");
        }
    }
}