using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_musica_sugerencias_estadoConfiguration : IEntityTypeConfiguration<ef_evento_musica_sugerencias_estado>
    {
        public void Configure(EntityTypeBuilder<ef_evento_musica_sugerencias_estado> builder)
        {
            builder.ToTable("ef_evento_musica_sugerencias_estado");

            builder.HasKey(x => x.id_evento_musica_sugerencia_estado);

            builder.Property(x => x.id_evento_musica_sugerencia_estado)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_invitado_musica_sugerencia).IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(15)
                   .HasDefaultValue("PENDIENTE")
                   .IsRequired();

            builder.Property(x => x.nota_interna)
                   .HasMaxLength(300);

            builder.HasIndex(x => x.id_invitado_musica_sugerencia)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_mus_sug_estado_sugerencia");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_mus_sug_estado_evento");

            builder.HasIndex(x => x.estado)
                   .HasDatabaseName("ix_ef_evento_mus_sug_estado_estado");
        }
    }
}
