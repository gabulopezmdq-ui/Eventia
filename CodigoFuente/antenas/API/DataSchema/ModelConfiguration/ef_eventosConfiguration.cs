using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_eventosConfiguration : IEntityTypeConfiguration<ef_eventos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_eventos> builder)
        {
            builder.ToTable("ef_eventos", "public");

            builder.HasKey(x => x.id_evento);

            builder.Property(x => x.id_evento)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_tipo_evento)
                   .IsRequired();

            builder.Property(x => x.id_idioma)
                   .IsRequired();
           
            builder.Property(x => x.id_pais)
                    .IsRequired(false);

            builder.Property(x => x.id_cuenta);
            builder.Property(x => x.id_unidad);
            builder.Property(x => x.id_cliente);

            builder.Property(x => x.anfitriones_texto)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.Property(x => x.id_dress_code);

            builder.Property(x => x.dress_code_descripcion)
                   .HasMaxLength(200);

            builder.Property(x => x.saludo)
                   .HasMaxLength(500);

            builder.Property(x => x.mensaje_bienvenida)
                   .HasMaxLength(500);

            builder.Property(x => x.notas)
                   .HasMaxLength(500);

            builder.Property(x => x.fecha_evento);

            builder.Property(x => x.tipo_operacion)
                   .HasMaxLength(20)
                   .IsRequired()
                   .HasDefaultValue("EVENTO")
                   .IsUnicode(false);

            builder.Property(x => x.fecha_inicio);

            builder.Property(x => x.fecha_fin);

            builder.HasIndex(x => x.tipo_operacion)
                   .HasDatabaseName("ix_ef_eventos_tipo_operacion");

            builder.HasIndex(x => new { x.fecha_inicio, x.fecha_fin })
                   .HasDatabaseName("ix_ef_eventos_programa_fechas")
                   .HasFilter("tipo_operacion = 'PROGRAMA'");

            builder.HasCheckConstraint(
                "ck_ef_eventos_tipo_operacion",
                "tipo_operacion in ('EVENTO', 'PROGRAMA')"
            );

            builder.HasCheckConstraint(
                "ck_ef_eventos_programa_fechas",
                "tipo_operacion <> 'PROGRAMA' or (fecha_inicio is not null and fecha_fin is not null and fecha_fin >= fecha_inicio)"
            );

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .HasDefaultValue("B")
                   .IsUnicode(false);

            builder.Property(x => x.rsvp_public_token)
                   .HasMaxLength(64);

            builder.HasIndex(x => x.rsvp_public_token)
                   .IsUnique()
                   .HasDatabaseName("ef_eventos_rsvp_public_token_key");

            builder.Property(x => x.id_usuario_rsvp_link_creator);

            builder.Property(x => x.modo_acceso)
                   .HasMaxLength(1)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.modo_asistencia)
                   .HasMaxLength(1)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.es_publico)
                   .IsRequired();

            builder.Property(x => x.id_acceso_default);
            builder.Property(x => x.id_plan);

            builder.Property(x => x.info_publica)
                   .HasMaxLength(2000);

            // Índices (como en tu DDL)
            builder.HasIndex(x => x.id_plan)
                   .HasDatabaseName("ix_ef_eventos_id_plan");

            builder.HasIndex(x => x.id_cuenta)
                   .HasDatabaseName("ix_ef_eventos_id_cuenta");

            builder.HasIndex(x => x.id_cliente)
                   .HasDatabaseName("ix_ef_eventos_id_cliente");

            builder.HasIndex(x => x.id_unidad)
                   .HasDatabaseName("ix_ef_eventos_id_unidad");

            // Check constraint B2B ids (según tu tabla)
            builder.HasCheckConstraint(
                "ck_ef_eventos_b2b_ids",
                "((id_cuenta is null and id_cliente is null and id_unidad is null) or (id_cuenta is not null))"
            );

            // Relaciones (FKs)
            builder.HasOne(x => x.tipo_evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_tipo_evento)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.dress_code)
                   .WithMany()
                   .HasForeignKey(x => x.id_dress_code)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.cliente)
                   .WithMany()
                   .HasForeignKey(x => x.id_cliente)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario_rsvp_link_creator)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_rsvp_link_creator)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.plan)
                   .WithMany()
                   .HasForeignKey(x => x.id_plan)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.acceso_default)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso_default)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.unidad)
                   .WithMany()
                   .HasForeignKey(x => x.id_unidad)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ef_paises>()
                   .WithMany()
                   .HasForeignKey(x => x.id_pais)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}