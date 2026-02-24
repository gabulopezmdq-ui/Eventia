using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitado_musica_votosConfiguration : IEntityTypeConfiguration<ef_invitado_musica_votos>
    {
        public void Configure(EntityTypeBuilder<ef_invitado_musica_votos> builder)
        {
            builder.ToTable("ef_invitado_musica_votos");

            builder.HasKey(x => x.id_invitado_musica_voto);

            builder.Property(x => x.id_invitado_musica_voto).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_invitado).IsRequired();
            builder.Property(x => x.id_invitado_musica_sugerencia).IsRequired();

            builder.Property(x => x.valor)
                   .HasDefaultValue((short)1)
                   .IsRequired();

            builder.HasIndex(x => new { x.id_evento, x.id_invitado })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_inv_mus_voto_evento_invitado");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_inv_mus_voto_evento");
        }
    }
}