using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_respuestasConfiguration : IEntityTypeConfiguration<ef_evento_live_respuestas>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_respuestas> builder)
        {
            builder.ToTable("ef_evento_live_respuestas");
            builder.HasKey(x => x.id_respuesta);
            builder.Property(x => x.token_consulta).HasMaxLength(100);
        }
    }
}