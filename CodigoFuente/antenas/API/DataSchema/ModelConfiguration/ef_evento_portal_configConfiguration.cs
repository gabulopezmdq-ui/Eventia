using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_portal_configConfiguration : IEntityTypeConfiguration<ef_evento_portal_config>
    {
        public void Configure(EntityTypeBuilder<ef_evento_portal_config> builder)
        {
            builder.ToTable("ef_evento_portal_config", "public");
            builder.HasKey(x => x.id_evento_portal_config);
            builder.Property(x => x.id_evento_portal_config).ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_portal_seccion).IsRequired();
            builder.Property(x => x.visible).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue(1);
            builder.Property(x => x.titulo_override).HasMaxLength(120);
            builder.Property(x => x.config_json).HasColumnType("jsonb");
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_evento, x.id_portal_seccion })
                   .IsUnique()
                   .HasDatabaseName("ux_evento_portal_config_evento_seccion");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("fk_evento_portal_config_evento");

            builder.HasOne(x => x.portal_seccion)
                   .WithMany(x => x.evento_portal_configs)
                   .HasForeignKey(x => x.id_portal_seccion)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("fk_evento_portal_config_seccion");
        }
    }
}
