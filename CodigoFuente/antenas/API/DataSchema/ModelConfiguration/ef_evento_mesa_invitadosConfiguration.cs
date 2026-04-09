using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_mesa_invitadosConfiguration : IEntityTypeConfiguration<ef_evento_mesa_invitados>
    {
        public void Configure(EntityTypeBuilder<ef_evento_mesa_invitados> builder)
        {
            builder.ToTable("ef_evento_mesa_invitados");
            builder.HasKey(x => new { x.id_mesa, x.id_invitado });

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");

            builder.HasOne(x => x.mesa)
                .WithMany(m => m.mesa_invitados)
                .HasForeignKey(x => x.id_mesa)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.invitado)
                .WithMany()
                .HasForeignKey(x => x.id_invitado)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
