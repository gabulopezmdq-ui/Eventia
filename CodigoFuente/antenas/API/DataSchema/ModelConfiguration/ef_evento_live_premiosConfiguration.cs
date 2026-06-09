using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_premiosConfiguration : IEntityTypeConfiguration<ef_evento_live_premios>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_premios> builder)
        {
            builder.ToTable("ef_evento_live_premios");
            builder.HasKey(x => x.id_premio);
            builder.Property(x => x.titulo).HasMaxLength(150).IsRequired();
            builder.Property(x => x.modo_premio).HasMaxLength(50).IsRequired();
            builder.Property(x => x.sponsor_nombre).HasMaxLength(150);
        }
    }
}