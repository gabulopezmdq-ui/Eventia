using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_beneficios_registroConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_evento_beneficios_registro>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_evento_beneficios_registro> builder)
        {
            builder.ToTable("ef_evento_beneficios_registro", "public");

            builder.HasKey(x => x.id_beneficio_registro);

            builder.Property(x => x.id_beneficio_registro)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.id_invitado)
                   .IsRequired();

            builder.Property(x => x.id_acceso_link)
                   .IsRequired();

            builder.Property(x => x.id_tipo_beneficio_registro)
                   .IsRequired();

            builder.Property(x => x.titulo_snapshot)
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(x => x.descripcion_snapshot)
                   .HasMaxLength(250);

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsUnicode(false)
                   .IsRequired()
                   .HasDefaultValue("G");

            builder.Property(x => x.codigo_canje)
                   .HasMaxLength(64);

            builder.Property(x => x.fecha_otorgado)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_canje);

            builder.Property(x => x.fecha_vencimiento);

            builder.Property(x => x.id_usuario_valida);

            builder.Property(x => x.observaciones)
                   .HasMaxLength(250);

            builder.HasIndex(x => new { x.id_evento, x.estado, x.fecha_otorgado })
                   .HasDatabaseName("ix_ef_evento_beneficios_registro_evento_estado");

            builder.HasIndex(x => x.id_invitado)
                   .HasDatabaseName("ix_ef_evento_beneficios_registro_invitado");

            builder.HasIndex(x => new
            {
                x.id_evento,
                x.id_invitado,
                x.id_acceso_link,
                x.id_tipo_beneficio_registro
            })
            .IsUnique()
            .HasDatabaseName("ux_ef_evento_beneficios_registro_evento_invitado_link_tipo");

            builder.HasCheckConstraint(
                "ck_ef_evento_beneficios_registro_estado",
                "estado = any (array['G'::bpchar, 'C'::bpchar, 'V'::bpchar, 'A'::bpchar])"
            );

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.invitado)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.acceso_link)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso_link)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.tipo_beneficio_registro)
                   .WithMany()
                   .HasForeignKey(x => x.id_tipo_beneficio_registro)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario_valida)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_valida)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}