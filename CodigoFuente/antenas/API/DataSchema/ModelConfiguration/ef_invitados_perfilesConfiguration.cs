using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_invitados_perfilesConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_invitados_perfiles>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_invitados_perfiles> builder)
        {
            builder.ToTable("ef_invitado_perfiles", "public");

            builder.HasKey(x => x.id_invitado);

            builder.Property(x => x.id_invitado).ValueGeneratedNever();

            builder.Property(x => x.instagram).HasMaxLength(100);
            builder.Property(x => x.zona).HasMaxLength(120);
            builder.Property(x => x.ciudad).HasMaxLength(100);

            builder.Property(x => x.campania_fuente).HasMaxLength(80);
            builder.Property(x => x.campania_medio).HasMaxLength(80);
            builder.Property(x => x.campania_nombre).HasMaxLength(120);
            builder.Property(x => x.campania_contenido).HasMaxLength(120);
            builder.Property(x => x.campania_termino).HasMaxLength(120);
            builder.Property(x => x.pagina_origen).HasMaxLength(200);
            builder.Property(x => x.referer).HasMaxLength(300);

            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.fecha_modif);

            builder.HasOne(x => x.invitado)
                   .WithOne()
                   .HasForeignKey<API.DataSchema.ef_invitados_perfiles>(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.perfil_asistencia)
                   .WithMany()
                   .HasForeignKey(x => x.id_perfil_asistencia)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}