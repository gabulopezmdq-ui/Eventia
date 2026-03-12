using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_b2b_prospectos_histConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_b2b_prospectos_hist>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_b2b_prospectos_hist> builder)
        {
            builder.ToTable("ef_b2b_prospectos_hist", "public");

            builder.HasKey(x => x.id_hist);

            builder.Property(x => x.id_hist)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_prospecto)
                   .IsRequired();

            builder.Property(x => x.fecha)
                   .HasDefaultValueSql("now()")
                   .IsRequired();

            builder.Property(x => x.id_usuario);

            builder.Property(x => x.tipo)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.detalle)
                   .IsRequired();

            builder.Property(x => x.estado_nuevo)
                   .HasMaxLength(20);

            builder.Property(x => x.proximo_contacto);

            // Índices
            builder.HasIndex(x => new { x.id_prospecto, x.fecha })
                   .HasDatabaseName("ix_b2b_hist_prospecto_fecha");

            builder.HasIndex(x => x.tipo)
                   .HasDatabaseName("ix_b2b_hist_tipo");

            // FK prospecto (ON DELETE CASCADE)
            builder.HasOne<API.DataSchema.ef_b2b_prospectos>()
                   .WithMany()
                   .HasForeignKey(x => x.id_prospecto)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("fk_hist_prospecto");

            // FK usuario (Restrict)
            builder.HasOne<API.DataSchema.ef_usuarios>()
                   .WithMany()
                   .HasForeignKey(x => x.id_usuario)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("fk_hist_usuario");
        }
    }
}
