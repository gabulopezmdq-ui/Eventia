using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_portal_validacionesConfiguration : IEntityTypeConfiguration<ef_portal_validaciones>
    {
        public void Configure(EntityTypeBuilder<ef_portal_validaciones> builder)
        {
            builder.ToTable("ef_portal_validaciones", "public");

            builder.HasKey(x => x.id_portal_validacion);

            builder.Property(x => x.token_consulta)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.codigo)
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.canal)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.destino)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.validado)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.HasIndex(x => new { x.token_consulta, x.validado, x.fecha_expiracion })
                .HasDatabaseName("ix_portal_validaciones_token");
        }
    }
}
