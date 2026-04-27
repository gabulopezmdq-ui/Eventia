using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_checkinsConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_evento_checkins>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_evento_checkins> builder)
        {
            builder.ToTable("ef_evento_checkins", "public");

            builder.HasKey(x => x.id_checkin);

            builder.Property(x => x.id_checkin)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento).IsRequired();
            builder.Property(x => x.id_invitado).IsRequired();
            builder.Property(x => x.tipo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.fecha).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.observaciones).HasMaxLength(500);

            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

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

            builder.HasOne(x => x.usuario_operador)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario_operador)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}