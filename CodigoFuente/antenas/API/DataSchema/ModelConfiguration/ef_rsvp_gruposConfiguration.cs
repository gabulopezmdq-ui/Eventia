using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_rsvp_gruposConfiguration : IEntityTypeConfiguration<ef_rsvp_grupos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_rsvp_grupos> builder)
        {
            builder.ToTable("ef_rsvp_grupos", "public");

            builder.HasKey(x => x.id_rsvp_grupo)
                .HasName("ef_rsvp_grupos_pkey");

            builder.Property(x => x.id_rsvp_grupo)
                .HasColumnName("id_rsvp_grupo")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_acceso)
                .HasColumnName("id_acceso")
                .IsRequired();

            builder.Property(x => x.id_acceso_link)
                .HasColumnName("id_acceso_link")
                .IsRequired(false);

            builder.Property(x => x.max_personas_total)
                .HasColumnName("max_personas_total")
                .IsRequired();

            builder.Property(x => x.max_adultos)
                .HasColumnName("max_adultos");

            builder.Property(x => x.cantidad_total)
                .HasColumnName("cantidad_total")
                .IsRequired();

            builder.Property(x => x.rsvp_estado)
                .HasColumnName("rsvp_estado")
                .HasColumnType("char(1)")
                .HasDefaultValue("P")
                .IsRequired();

            builder.Property(x => x.rsvp_mensaje)
                .HasColumnName("rsvp_mensaje")
                .HasMaxLength(300);

            builder.Property(x => x.fecha_rsvp)
                .HasColumnName("fecha_rsvp");

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .HasDefaultValue(true)
                .IsRequired();

            // Índices
            builder.HasIndex(x => x.id_evento)
                .HasDatabaseName("ix_rg_evento");

            builder.HasIndex(x => x.id_acceso_link)
                .HasDatabaseName("ix_rg_link");

            builder.HasIndex(x => new { x.id_evento, x.rsvp_estado })
                .HasDatabaseName("ix_rg_evento_estado");

            // Foreign Keys
            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .HasConstraintName("fk_rg_evento");

            builder.HasOne(x => x.acceso)
                .WithMany()
                .HasForeignKey(x => x.id_acceso)
                .HasConstraintName("fk_rg_acceso");

            builder.HasOne(x => x.acceso_link)
                .WithMany()
                .HasForeignKey(x => x.id_acceso_link)
                .HasConstraintName("fk_rg_link");
            builder.ToTable("ef_rsvp_grupos", "public");

            builder.HasKey(x => x.id_rsvp_grupo);

            builder.Property(x => x.id_rsvp_grupo)
                .HasColumnName("id_rsvp_grupo")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_acceso)
                .HasColumnName("id_acceso")
                .IsRequired();

            builder.Property(x => x.id_acceso_link)
                .HasColumnName("id_acceso_link");

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            //----------------------------------------
            // RELACION CORRECTA CON acceso_link
            //----------------------------------------

            builder.HasOne(x => x.acceso_link)
                .WithMany(x => x.rsvp_grupos)
                .HasForeignKey(x => x.id_acceso_link)
                .HasConstraintName("fk_rsvp_grupo_acceso_link");

            // Check constraints
            builder.HasCheckConstraint(
                "ck_rg_max_personas",
                "max_personas_total >= 1");

            builder.HasCheckConstraint(
                "ck_rg_rsvp_estado",
                "rsvp_estado in ('P','Y','N')");

            builder.HasCheckConstraint(
                "ck_rg_cantidad_total",
                "cantidad_total >= 1 AND cantidad_total <= max_personas_total");

            builder.Property(x => x.cant_adultos_sin_nombre)
                    .IsRequired(false);

            builder.Property(x => x.cant_menores_sin_nombre)
        .IsRequired(false);

        }
    }
}
