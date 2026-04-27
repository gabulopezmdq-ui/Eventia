using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_audiencia_tagsConfiguration : IEntityTypeConfiguration<ef_param_audiencia_tags>
    {
        public void Configure(EntityTypeBuilder<ef_param_audiencia_tags> builder)
        {
            builder.ToTable("ef_param_audiencia_tags", "public");

            builder.HasKey(x => x.id_param_audiencia_tag)
                .HasName("ef_param_audiencia_tags_pkey");

            builder.Property(x => x.id_param_audiencia_tag)
                .HasColumnName("id_param_audiencia_tag")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.tag_tipo)
                .HasColumnName("tag_tipo")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.tag_valor)
                .HasColumnName("tag_valor")
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(x => x.nombre_mostrar)
                .HasColumnName("nombre_mostrar")
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasColumnName("descripcion")
                .HasMaxLength(240);

            builder.Property(x => x.origen)
                .HasColumnName("origen")
                .HasMaxLength(10)
                .HasDefaultValue("MANUAL")
                .IsRequired();

            builder.Property(x => x.permite_asignacion_manual)
                .HasColumnName("permite_asignacion_manual")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .HasDefaultValue(1)
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.HasIndex(x => new { x.tag_tipo, x.tag_valor })
                .IsUnique()
                .HasDatabaseName("ux_ef_param_audiencia_tags");

            builder.HasIndex(x => new { x.tag_tipo, x.activo, x.orden })
                .HasDatabaseName("ix_ef_param_audiencia_tags_tipo");

            builder.HasIndex(x => new { x.permite_asignacion_manual, x.activo, x.orden })
                .HasDatabaseName("ix_ef_param_audiencia_tags_manual");

            builder.HasCheckConstraint(
                "ck_ef_param_audiencia_tags_origen",
                "origen in ('MANUAL','AUTO')");
        }
    }
}