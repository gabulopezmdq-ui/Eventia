using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_regalos_lista_reservasConfiguration : IEntityTypeConfiguration<ef_evento_regalos_lista_reservas>
    {
        public void Configure(EntityTypeBuilder<ef_evento_regalos_lista_reservas> builder)
        {
            builder.ToTable("ef_evento_regalos_lista_reservas");

            builder.HasKey(x => x.id_reserva);
            builder.Property(x => x.id_reserva).ValueGeneratedOnAdd();

            builder.Property(x => x.rsvp_token).HasMaxLength(64);
            builder.Property(x => x.nombre_mostrado).HasMaxLength(120);

            builder.Property(x => x.es_anonimo).HasDefaultValue(false).IsRequired();
            builder.Property(x => x.cantidad).HasDefaultValue(1).IsRequired();

            builder.Property(x => x.estado).HasMaxLength(20).HasDefaultValue("RESERVA_ACTIVA").IsRequired();

            builder.Property(x => x.mensaje).HasMaxLength(300);

            builder.Property(x => x.fecha_reserva).IsRequired();

            builder.Property(x => x.activo).HasDefaultValue(true).IsRequired();

            builder.HasIndex(x => new { x.id_regalo_item, x.estado }).HasDatabaseName("ix_ef_regalos_lista_reservas_item_estado");
            builder.HasIndex(x => new { x.id_evento, x.fecha_reserva }).HasDatabaseName("ix_ef_regalos_lista_reservas_evento_fecha");

            builder.HasOne(x => x.ef_eventos)
                   .WithMany()
                   .HasForeignKey(x => x.id_evento)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_evento_regalos_lista_items)
                   .WithMany()
                   .HasForeignKey(x => x.id_regalo_item)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ef_invitados)
                   .WithMany()
                   .HasForeignKey(x => x.id_invitado)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}