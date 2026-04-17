using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_audiencias_personasConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_audiencias_personas>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_audiencias_personas> builder)
        {
            builder.ToTable("ef_audiencias_personas", "public");

            builder.HasKey(x => x.id_audiencia_persona);

            builder.Property(x => x.id_audiencia_persona)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_cuenta).IsRequired();

            builder.Property(x => x.nombre).IsRequired().HasMaxLength(120);
            builder.Property(x => x.apellido).IsRequired().HasMaxLength(120);
            builder.Property(x => x.email).HasMaxLength(200);
            builder.Property(x => x.celular).HasMaxLength(50);
            builder.Property(x => x.instagram).HasMaxLength(100);
            builder.Property(x => x.zona).HasMaxLength(120);
            builder.Property(x => x.ciudad).HasMaxLength(120);

            builder.Property(x => x.acepta_comunicaciones).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.acepta_promociones).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.cuenta)
                   .WithMany()
                   .HasForeignKey(x => x.id_cuenta)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
