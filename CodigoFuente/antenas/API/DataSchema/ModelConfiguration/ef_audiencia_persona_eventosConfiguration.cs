using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_audiencia_persona_eventosConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_audiencia_persona_eventos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_audiencia_persona_eventos> builder)
        {
            builder.ToTable("ef_audiencia_persona_eventos", "public");

            builder.HasKey(x => x.id_audiencia_persona_evento);

            builder.Property(x => x.id_audiencia_persona_evento)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_audiencia_persona).IsRequired();
            builder.Property(x => x.id_evento).IsRequired();

            builder.Property(x => x.origen_registro).HasMaxLength(80);

            builder.Property(x => x.registrado).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.asistio).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.beneficio_otorgado).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.beneficio_canjeado).IsRequired().HasDefaultValue(false);

            builder.Property(x => x.fecha_registro).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_asistencia);
            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.audiencia_persona)
                   .WithMany()
                   .HasForeignKey(x => x.id_audiencia_persona)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.unidad)
                   .WithMany()
                   .HasForeignKey(x => x.id_unidad)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.invitado)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.acceso)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.acceso_link)
                   .WithMany()
                   .HasForeignKey(x => x.id_acceso_link)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}