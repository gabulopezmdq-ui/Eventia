using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_musica_bloqueosConfiguration : IEntityTypeConfiguration<ef_evento_musica_bloqueos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_musica_bloqueos> builder)
        {
            builder.ToTable("ef_evento_musica_bloqueos");

            builder.HasKey(x => x.id_evento_musica_bloqueo);

            builder.Property(x => x.id_evento_musica_bloqueo)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.titulo)
                   .HasMaxLength(150);

            builder.Property(x => x.artista)
                   .HasMaxLength(150);

            builder.Property(x => x.link)
                   .HasMaxLength(300);

            builder.Property(x => x.nota)
                   .HasMaxLength(300);

            builder.Property(x => x.hash_normalizado)
                   .HasMaxLength(64)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                    .IsRequired()
                    .HasDefaultValueSql("now()");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_mus_bloq_evento");

            builder.HasIndex(x => new { x.id_evento, x.hash_normalizado })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_mus_bloq_evento_hash");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_mus_bloq_activo_true")
                   .HasFilter("activo = true");
        }
    }
}

