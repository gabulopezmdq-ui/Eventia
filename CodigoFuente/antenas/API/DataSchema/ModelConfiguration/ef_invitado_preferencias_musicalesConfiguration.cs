using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitado_preferencias_musicalesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_invitado_preferencias_musicales>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_invitado_preferencias_musicales> builder)
        {
            builder.ToTable("ef_invitado_preferencias_musicales", "public");

            builder.HasKey(x => new { x.id_invitado, x.id_preferencia_musical });

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");

            builder.HasOne(x => x.invitado)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.preferencia_musical)
                   .WithMany()
                   .HasForeignKey(x => x.id_preferencia_musical)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}