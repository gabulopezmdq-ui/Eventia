using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_rsvp_integrante_restriccionesConfiguration : IEntityTypeConfiguration<ef_rsvp_integrante_restricciones>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_rsvp_integrante_restricciones> builder)
        {
            builder.ToTable("ef_rsvp_integrante_restricciones", "public");

            builder.HasKey(x => new
            {
                x.id_rsvp_grupo_integrante,
                x.id_restriccion_alim
            })
            .HasName("ef_rsvp_integrante_restricciones_pkey");

            builder.Property(x => x.fecha_alta)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.HasOne(x => x.ef_rsvp_grupo_integrantes)
                   .WithMany()
                   .HasForeignKey(x => x.id_rsvp_grupo_integrante)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("fk_rir_integrante");

            builder.HasOne(x => x.ef_param_restricciones_alimentarias)
                   .WithMany()
                   .HasForeignKey(x => x.id_restriccion_alim)
                   .HasConstraintName("fk_rir_restr");
        }
    }
}
