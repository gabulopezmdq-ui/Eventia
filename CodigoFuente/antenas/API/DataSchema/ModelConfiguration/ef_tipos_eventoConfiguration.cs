using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_tipos_eventoConfiguration : IEntityTypeConfiguration<ef_tipos_evento>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_tipos_evento> builder)
        {
            builder.ToTable("ef_tipos_evento");
              
            builder.HasKey(x => x.id_tipo_evento);

            builder.Property(x => x.id_tipo_evento)
                   .ValueGeneratedOnAdd();
              
            builder.Property(x => x.descripcion)
                    .HasMaxLength(100);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.descripcion)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_tipos_evento_descripcion");
        }
    }
}
