using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_ganadoresConfiguration : IEntityTypeConfiguration<ef_evento_live_ganadores>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_ganadores> builder)
        {
            builder.ToTable("ef_evento_live_ganadores");
            builder.HasKey(x => x.id_ganador);
            builder.Property(x => x.token_consulta).HasMaxLength(100);
            builder.Property(x => x.estado).HasMaxLength(40).IsRequired();
        }
    }
}