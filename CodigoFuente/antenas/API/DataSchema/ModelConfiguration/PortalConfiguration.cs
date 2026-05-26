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
            builder.ToTable("portal_persona", "public");
            builder.HasKey(p => p.IdPortalPersona);
            builder.HasIndex(p => p.Email).IsUnique();
            builder.HasIndex(p => p.Telefono).IsUnique(false);
            builder.Property(p => p.TokenPortal).HasDefaultValueSql("gen_random_uuid()");
        }

        public void Configure(EntityTypeBuilder<PortalAcceso> builder)
        {
            builder.ToTable("portal_acceso", "public");
            builder.HasKey(a => a.IdPortalAcceso);
            builder.HasIndex(a => a.TokenConsulta).IsUnique();
            builder.HasOne(a => a.PortalPersona)
                   .WithMany()
                   .HasForeignKey(a => a.IdPortalPersona);
        }

        public void Configure(EntityTypeBuilder<PortalVerificacion> builder)
        {
            builder.ToTable("portal_verificacion", "public");
            builder.HasKey(v => v.Id);
            builder.HasIndex(v => v.TokenConsulta);
        }
    }
}
