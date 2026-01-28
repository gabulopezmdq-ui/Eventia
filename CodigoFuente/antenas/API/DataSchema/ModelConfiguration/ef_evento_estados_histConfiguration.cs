using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_estados_histConfiguration : IEntityTypeConfiguration<ef_evento_estados_hist>
    {
        public void Configure(EntityTypeBuilder<ef_evento_estados_hist> builder)
        {
            builder.ToTable("ef_evento_estados_hist", "public");

            builder.HasKey(x => x.id_evento_estado_hist);

            builder.Property(x => x.id_evento_estado_hist)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                   .IsRequired();

            builder.Property(x => x.id_usuario)
                   .IsRequired();

            builder.Property(x => x.fecha)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .IsUnicode(false);

            builder.Property(x => x.observaciones)
                   .HasMaxLength(500);


            // FKs
            builder.HasOne(x => x.evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.usuario)
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}