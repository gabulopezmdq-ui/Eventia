using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_param_checklist_prioridadesConfiguration : IEntityTypeConfiguration<ef_param_checklist_prioridades>
    {
        public void Configure(EntityTypeBuilder<ef_param_checklist_prioridades> builder)
        {
            builder.ToTable("ef_param_checklist_prioridades");

            builder.HasKey(x => x.id_checklist_prioridad);

            builder.Property(x => x.id_checklist_prioridad)
                .HasColumnName("id_checklist_prioridad");

            builder.Property(x => x.codigo)
                .HasColumnName("codigo")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.orden)
                .HasColumnName("orden")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_ef_param_checklist_prioridades_codigo");
        }
    }
}