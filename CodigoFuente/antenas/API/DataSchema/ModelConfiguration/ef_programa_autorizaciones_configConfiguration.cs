using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_programa_autorizaciones_configConfiguration : IEntityTypeConfiguration<ef_programa_autorizaciones_config>
    {
        public void Configure(EntityTypeBuilder<ef_programa_autorizaciones_config> builder)
        {
            builder.ToTable("ef_programa_autorizaciones_config", "public");

            builder.HasKey(x => x.id_programa_autorizacion_config);

            builder.Property(x => x.id_programa_autorizacion_config)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.id_autorizacion_base)
                   .IsRequired();

            builder.Property(x => x.codigo)
                   .HasMaxLength(60)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.titulo_override)
                   .HasMaxLength(160);

            builder.Property(x => x.texto_override)
                   .HasMaxLength(1200);

            builder.Property(x => x.obligatoria)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.requiere_aceptacion)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.requiere_datos_responsable)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_evento, x.id_autorizacion_base })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_programa_aut_config_evento_base");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                   .HasDatabaseName("ix_ef_programa_aut_config_evento");

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.autorizacion_base)
                   .WithMany()
                   .HasForeignKey(x => x.id_autorizacion_base)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}