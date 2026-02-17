using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_solicitudes_plantillaConfiguration : IEntityTypeConfiguration<ef_solicitudes_plantilla>
    {
        public void Configure(EntityTypeBuilder<ef_solicitudes_plantilla> b)
        {
            b.ToTable("ef_solicitudes_plantilla");
            b.HasKey(x => x.id_solicitud);

            b.Property(x => x.id_solicitud).ValueGeneratedOnAdd();

            b.Property(x => x.id_evento).IsRequired();
            b.Property(x => x.id_tipo_evento).IsRequired();

            b.Property(x => x.id_plantilla_referida).IsRequired(false);

            b.Property(x => x.motivo).HasMaxLength(200).IsRequired(false);
            b.Property(x => x.detalle).HasMaxLength(500).IsRequired(false);

            b.Property(x => x.payload)
                .HasColumnType("jsonb")
                .IsRequired();

            // en DB es char(1)
            b.Property(x => x.estado)
                .HasColumnType("character(1)")
                .IsRequired();

            b.Property(x => x.id_usuario_solicita).IsRequired(false);

            b.Property(x => x.fecha_alta).IsRequired();
            b.Property(x => x.fecha_revision).IsRequired(false);

            b.Property(x => x.id_usuario_revisa).IsRequired(false);

            b.Property(x => x.observaciones_admin).HasMaxLength(500).IsRequired(false);

            // FK a evento (CASCADE en DB)
            b.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .OnDelete(DeleteBehavior.Cascade);

            // índices (coinciden con tu DDL)
            b.HasIndex(x => x.id_tipo_evento).HasDatabaseName("ix_ef_solicitudes_plantilla_tipo");
            b.HasIndex(x => x.estado).HasDatabaseName("ix_ef_solicitudes_plantilla_estado");
        }
    }
}