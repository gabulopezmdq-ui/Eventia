using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_musica_playlistConfiguration : IEntityTypeConfiguration<ef_evento_musica_playlist>
    {
        public void Configure(EntityTypeBuilder<ef_evento_musica_playlist> builder)
        {
            builder.ToTable("ef_evento_musica_playlist");

            builder.HasKey(x => x.id_evento_musica_playlist);

            builder.Property(x => x.id_evento_musica_playlist).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.titulo)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.Property(x => x.artista)
                   .HasMaxLength(150);

            builder.Property(x => x.link)
                   .HasMaxLength(300);

            builder.Property(x => x.orden)
                   .HasDefaultValue(1)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_mus_playlist_evento");
        }
    }
}
