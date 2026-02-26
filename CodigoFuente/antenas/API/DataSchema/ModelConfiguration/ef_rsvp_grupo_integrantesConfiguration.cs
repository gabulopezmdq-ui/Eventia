using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_rsvp_grupo_integrantesConfiguration : IEntityTypeConfiguration<ef_rsvp_grupo_integrantes>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_rsvp_grupo_integrantes> builder)
        {
            builder.ToTable("ef_rsvp_grupo_integrantes", "public");

            builder.HasKey(x => x.id_rsvp_grupo_integrante)
                .HasName("ef_rsvp_grupo_integrantes_pkey");

            builder.Property(x => x.id_rsvp_grupo_integrante)
                .HasColumnName("id_rsvp_grupo_integrante")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_rsvp_grupo)
                .HasColumnName("id_rsvp_grupo")
                .IsRequired();

            builder.Property(x => x.id_invitado)
                .HasColumnName("id_invitado")
                .IsRequired();

            builder.Property(x => x.rol)
                .HasColumnName("rol")
                .HasColumnType("char(1)")
                .IsRequired();

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .HasDefaultValue(1)
                .IsRequired();

            builder.Property(x => x.id_evento_edad_rango)
                .HasColumnName("id_evento_edad_rango");

            builder.Property(x => x.edad_anios)
                .HasColumnName("edad_anios");

            builder.Property(x => x.requiere_asistencia)
                .HasColumnName("requiere_asistencia")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.alimentacion_detalle)
                .HasColumnName("alimentacion_detalle")
                .HasMaxLength(200);

            builder.Property(x => x.rol_evento)
                .HasColumnName("rol_evento")
                .HasColumnType("char(1)")
                .HasDefaultValue("A")
                .IsRequired();

            // Índice único: id_invitado
            builder.HasIndex(x => x.id_invitado)
                .IsUnique()
                .HasDatabaseName("ux_rgi_invitado");

            // Índice: id_rsvp_grupo
            builder.HasIndex(x => x.id_rsvp_grupo)
                .HasDatabaseName("ix_rgi_grupo");

            // Índice: id_evento_edad_rango
            builder.HasIndex(x => x.id_evento_edad_rango)
                .HasDatabaseName("ix_rgi_evento_edad");

            // Índice único parcial: un titular por grupo
            builder.HasIndex(x => x.id_rsvp_grupo)
                .IsUnique()
                .HasDatabaseName("ux_rgi_un_titular_por_grupo")
                .HasFilter("rol = 'T'");

            // Foreign Keys
            builder.HasOne(x => x.rsvp_grupo)
                .WithMany(g => g.integrantes)
                .HasForeignKey(x => x.id_rsvp_grupo)
                .HasConstraintName("fk_rgi_grupo");

            builder.HasOne(x => x.invitado)
                .WithMany()
                .HasForeignKey(x => x.id_invitado)
                .HasConstraintName("fk_rgi_invitado");

            builder.HasOne(x => x.evento_edad_rango)
                .WithMany()
                .HasForeignKey(x => x.id_evento_edad_rango)
                .HasConstraintName("fk_rgi_evento_edad");

            // Check constraints
            builder.HasCheckConstraint(
                "ck_rgi_orden",
                "orden >= 1");

            builder.HasCheckConstraint(
                "ck_rgi_rol",
                "rol in ('T','A')");

            builder.HasCheckConstraint(
                "ck_rgi_edad_anios",
                "edad_anios IS NULL OR (edad_anios >= 0 AND edad_anios <= 120)");
            
            builder.Property(x => x.rol_evento)
                 .HasColumnType("character(1)")
                 .HasDefaultValue("A")
                 .IsRequired();
        }
    }
}
