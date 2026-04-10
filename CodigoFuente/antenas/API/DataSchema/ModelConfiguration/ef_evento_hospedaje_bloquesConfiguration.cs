using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_hospedaje_bloquesConfiguration : IEntityTypeConfiguration<ef_evento_hospedaje_bloques>
    {
        public void Configure(EntityTypeBuilder<ef_evento_hospedaje_bloques> builder)
        {
            builder.ToTable("ef_evento_hospedaje_bloques", "public");
            builder.HasKey(x => x.id_bloque);

            builder.Property(x => x.id_bloque).ValueGeneratedOnAdd();
            builder.Property(x => x.id_hospedaje).IsRequired();

            builder.Property(x => x.nombre_reserva).HasMaxLength(120);
            builder.Property(x => x.codigo_promocional).HasMaxLength(60);
            builder.Property(x => x.condiciones).HasMaxLength(240);
            builder.Property(x => x.url_bloque).HasMaxLength(400);

            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.id_hospedaje).HasDatabaseName("ix_bloq_hosp");

            builder.HasOne(x => x.hospedaje)
                   .WithMany(h => h.bloques)
                   .HasForeignKey(x => x.id_hospedaje)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}