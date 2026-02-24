using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_linksConfiguration : IEntityTypeConfiguration<ef_evento_links>
    {
        public void Configure(EntityTypeBuilder<ef_evento_links> builder)
        {
            builder.ToTable("ef_evento_links");

            builder.HasKey(x => x.id_evento_link);

            builder.Property(x => x.id_evento_link)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.tipo)
                   .HasMaxLength(40)
                   .IsRequired();

            builder.Property(x => x.token)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.scopes)
                   .HasColumnType("jsonb");

            builder.Property(x => x.descripcion)
                   .HasMaxLength(120);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.token)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_evento_links_token");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_links_evento");

            builder.HasIndex(x => x.id_evento)
                   .HasDatabaseName("ix_ef_evento_links_activo_true")
                   .HasFilter("activo = true");

            builder.HasIndex(x => new { x.id_evento, x.tipo })
                   .HasDatabaseName("ix_ef_evento_links_evento_tipo");
        }
    }
}
