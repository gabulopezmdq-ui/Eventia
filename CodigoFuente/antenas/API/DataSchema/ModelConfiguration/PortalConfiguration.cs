using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using API.DataSchema;

namespace API.DataSchema.ModelConfiguration
{
    public class PortalConfiguration : IEntityTypeConfiguration<PortalPersona>,
                                       IEntityTypeConfiguration<PortalAcceso>,
                                       IEntityTypeConfiguration<PortalVerificacion>
    {
        public void Configure(EntityTypeBuilder<PortalPersona> builder)
        {
            builder.ToTable("ef_portal_personas", "public");
            builder.HasKey(p => p.IdPortalPersona);
            
            builder.Property(p => p.IdPortalPersona).HasColumnName("id_portal_persona");
            builder.Property(p => p.TokenPortal).HasColumnName("token_portal").HasDefaultValueSql("gen_random_uuid()");
            builder.Property(p => p.Nombre).HasColumnName("nombre");
            builder.Property(p => p.Email).HasColumnName("email");
            builder.Property(p => p.Telefono).HasColumnName("telefono");
            builder.Property(p => p.FechaAlta).HasColumnName("fecha_alta");
            builder.Property(p => p.Activo).HasColumnName("activo");

            builder.HasIndex(p => p.Email).IsUnique();
            builder.HasIndex(p => p.Telefono).IsUnique(false);
        }

        public void Configure(EntityTypeBuilder<PortalAcceso> builder)
        {
            builder.ToTable("ef_portal_accesos", "public");
            builder.HasKey(a => a.IdPortalAcceso);

            builder.Property(a => a.IdPortalAcceso).HasColumnName("id_portal_acceso");
            builder.Property(a => a.IdPortalPersona).HasColumnName("id_portal_persona");
            builder.Property(a => a.TokenConsulta).HasColumnName("token_consulta");
            builder.Property(a => a.Tipo).HasColumnName("tipo").HasConversion<string>();
            builder.Property(a => a.IdEvento).HasColumnName("id_evento");
            builder.Property(a => a.IdInscripcion).HasColumnName("id_inscripcion");
            builder.Property(a => a.IdInvitado).HasColumnName("id_invitado");
            builder.Property(a => a.GrupoId).HasColumnName("grupo_id");
            builder.Property(a => a.TituloOverride).HasColumnName("titulo_override");
            builder.Property(a => a.Activo).HasColumnName("activo");
            builder.Property(a => a.FechaAlta).HasColumnName("fecha_alta");
            builder.Property(a => a.FechaModif).HasColumnName("fecha_modif");

            builder.HasIndex(a => a.TokenConsulta).IsUnique();
            builder.HasOne(a => a.PortalPersona)
                   .WithMany()
                   .HasForeignKey(a => a.IdPortalPersona);
        }

        public void Configure(EntityTypeBuilder<PortalVerificacion> builder)
        {
            builder.ToTable("ef_portal_verificaciones", "public");
            builder.HasKey(v => v.Id);

            builder.Property(v => v.Id).HasColumnName("id_portal_verificacion");
            builder.Property(v => v.TokenConsulta).HasColumnName("token_consulta");
            builder.Property(v => v.EmailUsado).HasColumnName("email_usado");
            builder.Property(v => v.FechaHora).HasColumnName("fecha_hora");
            builder.Property(v => v.ResultadoOk).HasColumnName("resultado_ok");

            builder.HasIndex(v => v.TokenConsulta);
        }
    }
}
