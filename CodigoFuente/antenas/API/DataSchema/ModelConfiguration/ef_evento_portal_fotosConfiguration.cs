using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_portal_fotosConfiguration : IEntityTypeConfiguration<ef_evento_portal_fotos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_portal_fotos> builder)
        {
            builder.ToTable("ef_evento_portal_fotos", "public");
            builder.HasKey(x => x.id_portal_foto);
            builder.Property(x => x.id_portal_foto).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.titulo).HasMaxLength(120);
            builder.Property(x => x.descripcion).HasMaxLength(300);
            builder.Property(x => x.url_foto).HasMaxLength(600).IsRequired();
            builder.Property(x => x.fecha_foto);
            builder.Property(x => x.visible_portal).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.id_usuario_carga);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_evento, x.visible_portal, x.activo, x.fecha_foto })
                   .HasDatabaseName("ix_evento_portal_fotos_evento");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("fk_evento_portal_fotos_evento");

            builder.HasOne(x => x.usuario_carga)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_carga)
                   .OnDelete(DeleteBehavior.SetNull)
                   .HasConstraintName("fk_evento_portal_fotos_usuario");
        }
    }
}
