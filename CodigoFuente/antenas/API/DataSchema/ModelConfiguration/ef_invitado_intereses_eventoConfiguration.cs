using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitado_intereses_eventoConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_invitado_intereses_evento>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_invitado_intereses_evento> builder)
        {
            builder.ToTable("ef_invitado_intereses_evento", "public");

            builder.HasKey(x => new { x.id_invitado, x.id_interes_evento_publico });

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");

            builder.HasOne(x => x.invitado)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.interes_evento_publico)
                   .WithMany()
                   .HasForeignKey(x => x.id_interes_evento_publico)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}