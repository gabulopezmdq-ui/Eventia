using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{

        public class ef_invitadosConfiguration : IEntityTypeConfiguration<ef_invitados>
        {
            public void Configure(EntityTypeBuilder<ef_invitados> builder)
            {
                builder.ToTable("ef_invitados", "public");

                builder.HasKey(x => x.id_invitado);

                //------------------------------------------------
                // COLUMNAS
                //------------------------------------------------

                builder.Property(x => x.id_invitado)
                    .HasColumnName("id_invitado")
                    .ValueGeneratedOnAdd();

                builder.Property(x => x.id_evento)
                    .HasColumnName("id_evento")
                    .IsRequired();

                builder.Property(x => x.nombre)
                    .HasColumnName("nombre")
                    .HasMaxLength(80)
                    .IsRequired();

                builder.Property(x => x.apellido)
                    .HasColumnName("apellido")
                    .HasMaxLength(80)
                    .IsRequired();

                builder.Property(x => x.email)
                    .HasColumnName("email")
                    .HasMaxLength(200);

                builder.Property(x => x.celular)
                    .HasColumnName("celular")
                    .HasMaxLength(50);

                builder.Property(x => x.rsvp_token)
                    .HasColumnName("rsvp_token")
                    .HasMaxLength(64)
                    .IsRequired(false);

                builder.Property(x => x.rsvp_estado)
                    .HasColumnName("rsvp_estado")
                    .HasColumnType("char(1)")
                    .HasDefaultValue("P")
                    .IsRequired();

                builder.Property(x => x.fecha_alta)
                    .HasColumnName("fecha_alta")
                    .HasDefaultValueSql("now()")
                    .IsRequired();

                builder.Property(x => x.qr_token)
                    .HasColumnName("qr_token")
                    .HasMaxLength(64);

                builder.Property(x => x.id_acceso)
                    .HasColumnName("id_acceso");

                builder.Property(x => x.id_rsvp_grupo)
                    .HasColumnName("id_rsvp_grupo");

                builder.Property(x => x.id_usuario_invitador)
                    .HasColumnName("id_usuario_invitador");

                //------------------------------------------------
                // RELACIONES — EXPLICITAS Y LIMPIAS
                //------------------------------------------------

                builder
                    .HasOne(x => x.evento)
                    .WithMany()
                    .HasForeignKey(x => x.id_evento)
                    .HasPrincipalKey(e => e.id_evento)
                    .OnDelete(DeleteBehavior.Restrict);

                builder
                    .HasOne(x => x.acceso)
                    .WithMany()
                    .HasForeignKey(x => x.id_acceso)
                    .HasPrincipalKey(a => a.id_acceso)
                    .OnDelete(DeleteBehavior.Restrict);

                builder
                    .HasOne(x => x.rsvp_grupo)
                    .WithMany()
                    .HasForeignKey(x => x.id_rsvp_grupo)
                    .HasPrincipalKey(g => g.id_rsvp_grupo)
                    .OnDelete(DeleteBehavior.Restrict);

                builder
                    .HasOne(x => x.usuario_invitador)
                    .WithMany()
                    .HasForeignKey(x => x.id_usuario_invitador)
                    .HasPrincipalKey(u => u.id_usuario)
                    .OnDelete(DeleteBehavior.Restrict);
            }
        }
    }