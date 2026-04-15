using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_acceso_linksConfiguration : IEntityTypeConfiguration<ef_evento_acceso_links>
    {
        public void Configure(EntityTypeBuilder<ef_evento_acceso_links> builder)
        {
            builder.ToTable("ef_evento_acceso_links", "public");

            builder.HasKey(x => x.id_acceso_link)
                .HasName("ef_evento_acceso_links_pkey");

            builder.Property(x => x.id_acceso_link)
                .HasColumnName("id_acceso_link")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_acceso)
                .HasColumnName("id_acceso")
                .IsRequired();

            builder.Property(x => x.titulo)
                .HasColumnName("titulo")
                .HasMaxLength(60)
                .IsRequired();

            builder.Property(x => x.leyenda_publica)
                .HasColumnName("leyenda_publica")
                .HasMaxLength(200);

            builder.Property(x => x.token)
                .HasColumnName("token")
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.max_personas_total)
                .HasColumnName("max_personas_total")
                .IsRequired();

            builder.Property(x => x.max_adultos)
                .HasColumnName("max_adultos");

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.fecha_expiracion)
                .HasColumnName("fecha_expiracion");

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.Property(x => x.requiere_nombres_acompanantes)
               .HasColumnName("requiere_nombres_acompanantes");

            builder.Property(x => x.id_usuario_creador)
                .HasColumnName("id_usuario_creador");

            builder.Property(x => x.id_evento);

            // NUEVO
            builder.Property(x => x.es_captacion_publica)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.requiere_registro)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.cupo_beneficio);

            builder.Property(x => x.id_tipo_beneficio_registro);

            builder.Property(x => x.beneficio_titulo)
                   .HasMaxLength(120);

            builder.Property(x => x.beneficio_descripcion)
                   .HasMaxLength(250);

            builder.Property(x => x.beneficio_hasta);

            builder.Property(x => x.mostrar_disponibles)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(x => x.mensaje_post_registro)
                   .HasMaxLength(250);

            builder.Property(x => x.origen_default)
                   .HasMaxLength(30);

            builder.Property(x => x.permite_reutilizar_audiencia)
                   .IsRequired()
                   .HasDefaultValue(true);


            // Índices
            builder.HasIndex(x => x.token)
                .IsUnique()
                .HasDatabaseName("ux_eal_token");

            builder.HasIndex(x => x.id_acceso)
                .HasDatabaseName("ix_eal_acceso");

            builder.HasIndex(x => x.activo)
                .HasDatabaseName("ix_eal_activo");

            // Foreign Keys
            builder.HasOne(x => x.acceso)
                .WithMany()
                .HasForeignKey(x => x.id_acceso)
                .HasConstraintName("fk_eal_acceso");

            builder.HasOne(x => x.usuario_creador)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_creador)
                .HasConstraintName("fk_eal_usuario_creador");

            builder.HasOne(x => x.ef_eventos)
                    .WithMany()
                    .HasForeignKey(x => x.id_evento);


            // Check constraints
            builder.HasCheckConstraint(
                "ck_eal_max_adultos",
                "max_adultos IS NULL OR max_adultos >= 0");

            builder.HasCheckConstraint(
                "ck_eal_max_personas",
                "max_personas_total >= 1");

        }
    }
}
