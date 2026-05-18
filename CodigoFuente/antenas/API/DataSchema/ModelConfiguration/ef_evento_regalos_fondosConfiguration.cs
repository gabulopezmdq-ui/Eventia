using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_regalos_fondosConfiguration : IEntityTypeConfiguration<ef_evento_regalos_fondos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_fondos> builder)
        {
            builder.ToTable("ef_evento_regalos_fondos");

            builder.HasKey(x => x.id_fondo);
            builder.Property(x => x.id_fondo).ValueGeneratedOnAdd();

            builder.Property(x => x.titulo).HasMaxLength(150).IsRequired();
            builder.Property(x => x.descripcion_publica).HasMaxLength(500);

            builder.Property(x => x.moneda_base)
                   .HasMaxLength(3)
                   .HasDefaultValue("ARS")
                   .IsRequired();

            builder.Property(x => x.modo_confirmacion)
                   .HasMaxLength(30)
                   .HasDefaultValue("INVITADO_Y_ORGANIZADOR")
                   .IsRequired();

            builder.Property(x => x.permitir_excedente).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.mostrar_pendientes).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.mostrar_muro_mensajes).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.permitir_anonimo).HasDefaultValue(true).IsRequired();

            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.fecha_alta).IsRequired();

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}