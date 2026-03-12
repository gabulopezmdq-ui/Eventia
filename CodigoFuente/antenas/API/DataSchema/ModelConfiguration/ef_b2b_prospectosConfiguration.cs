using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_b2b_prospectosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_b2b_prospectos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_b2b_prospectos> builder)
        {
            builder.ToTable("ef_b2b_prospectos", "public");

            builder.HasKey(x => x.id_prospecto);

            builder.Property(x => x.id_prospecto)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.nombre_apellido)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.empresa_nombre)
                   .HasMaxLength(160)
                   .IsRequired();

            builder.Property(x => x.ciudad)
                   .HasMaxLength(80)
                   .IsRequired();

            builder.Property(x => x.pais)
                   .HasMaxLength(60)
                   .HasDefaultValue("AR")
                   .IsRequired();

            builder.Property(x => x.email)
                   .HasMaxLength(160);

            builder.Property(x => x.whatsapp)
                   .HasMaxLength(40);

            builder.Property(x => x.eventos_por_mes);

            builder.Property(x => x.origen)
                   .HasMaxLength(30)
                   .HasDefaultValue("LANDING_MODAL")
                   .IsRequired();

            builder.Property(x => x.campania_fuente)
                   .HasMaxLength(80);

            builder.Property(x => x.campania_medio)
                   .HasMaxLength(80);

            builder.Property(x => x.campania_nombre)
                   .HasMaxLength(120);

            builder.Property(x => x.campania_contenido)
                   .HasMaxLength(120);

            builder.Property(x => x.campania_termino)
                   .HasMaxLength(120);

            builder.Property(x => x.pagina_origen)
                   .HasMaxLength(200);

            builder.Property(x => x.referer)
                   .HasMaxLength(300);

            builder.Property(x => x.estado)
                   .HasMaxLength(20)
                   .HasDefaultValue("NUEVO")
                   .IsRequired();

            builder.Property(x => x.nota_interna);

            builder.Property(x => x.id_usuario_asignado);

            builder.Property(x => x.proximo_contacto);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.fecha_modif);

            // Índices (mismos nombres que el SQL recomendado)
            builder.HasIndex(x => x.estado)
                   .HasDatabaseName("ix_b2b_prospectos_estado");

            builder.HasIndex(x => x.fecha_alta)
                   .HasDatabaseName("ix_b2b_prospectos_fecha_alta");

            builder.HasIndex(x => x.proximo_contacto)
                   .HasDatabaseName("ix_b2b_prospectos_proximo_contacto");

            // FK a ef_usuarios (si tenés entidad ef_usuarios en el modelo)
            builder.HasOne<API.DataSchema.ef_usuarios>()
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_asignado)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("fk_ef_b2b_prospectos_usuario");
        }
    }
}
