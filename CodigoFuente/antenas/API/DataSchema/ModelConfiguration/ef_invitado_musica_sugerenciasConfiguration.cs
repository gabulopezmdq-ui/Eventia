using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitado_musica_sugerenciasConfiguration : IEntityTypeConfiguration<ef_invitado_musica_sugerencias>
    {
        public void Configure(EntityTypeBuilder<ef_invitado_musica_sugerencias> builder)
        {
            builder.ToTable("ef_invitado_musica_sugerencias");

            builder.HasKey(x => x.id_invitado_musica_sugerencia);

            builder.Property(x => x.id_invitado_musica_sugerencia).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_invitado).IsRequired();

            builder.Property(x => x.titulo).HasMaxLength(150).IsRequired();
            builder.Property(x => x.artista).HasMaxLength(150);
            builder.Property(x => x.link).HasMaxLength(300);
            builder.Property(x => x.nota).HasMaxLength(300);

            builder.Property(x => x.hash_normalizado)
                   .HasMaxLength(64)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_inv_mus_sug_evento");

            builder.HasIndex(x => x.id_invitado)
                   .HasDatabaseName("ix_ef_inv_mus_sug_invitado");

            builder.HasIndex(x => new { x.id_invitado, x.hash_normalizado })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_inv_mus_sug_invitado_hash");
        }
    }
}