using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_portal_recuperacion_tokensConfiguration : IEntityTypeConfiguration<ef_portal_recuperacion_tokens>
    {
        public void Configure(EntityTypeBuilder<ef_portal_recuperacion_tokens> builder)
        {
            builder.ToTable("ef_portal_recuperacion_tokens", "public");

            builder.HasKey(x => x.id_portal_recuperacion_token);

            builder.Property(x => x.token_recuperacion)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.codigo)
                .HasMaxLength(10);

            builder.Property(x => x.canal)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.destino)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.usado)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.HasIndex(x => x.token_recuperacion)
                .IsUnique()
                .HasDatabaseName("ux_portal_recuperacion_token");

            // Since ef_portal_personas might not be in code exactly as "ef_portal_personas",
            // we will use PortalPersona which is the existing one. Wait. The user says "ef_portal_personas".
            // Let's check what it's named in DataContext. In earlier responses I saw `PortalPersona` and `PortalPersonas`.
            builder.HasOne<PortalPersona>()
                .WithMany()
                .HasForeignKey(x => x.id_portal_persona)
                .HasConstraintName("fk_portal_recuperacion_persona");
        }
    }
}
