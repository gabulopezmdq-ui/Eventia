using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_musica_momentosConfiguration : IEntityTypeConfiguration<ef_evento_musica_momentos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_musica_momentos> builder)
        {
            builder.ToTable("ef_evento_musica_momentos");

            builder.HasKey(x => x.id_evento_musica_momento);

            builder.Property(x => x.id_evento_musica_momento).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.nombre)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.orden)
                   .HasDefaultValue(1)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_mus_momentos_evento");

            builder.HasIndex(x => new { x.id_evento, x.nombre })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_mus_momentos_evento_nombre");
        }
    }
}

