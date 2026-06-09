using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_dinamica_opcionesConfiguration : IEntityTypeConfiguration<ef_evento_live_dinamica_opciones>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_dinamica_opciones> builder)
        {
            builder.ToTable("ef_evento_live_dinamica_opciones");
            builder.HasKey(x => x.id_opcion);
            builder.Property(x => x.texto).HasMaxLength(150).IsRequired();
        }
    }
}