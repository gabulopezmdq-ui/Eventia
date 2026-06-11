using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_ganadoresConfiguration : IEntityTypeConfiguration<ef_evento_live_ganadores>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_ganadores> builder)
        {
            builder.ToTable("ef_evento_live_ganadores");

            builder.HasKey(x => x.id_ganador);

            builder.Property(x => x.id_ganador)
                .HasColumnName("id_ganador");

            builder.Property(x => x.id_premio)
                .HasColumnName("id_premio")
                .IsRequired();

            builder.Property(x => x.id_dinamica)
                .HasColumnName("id_dinamica")
                .IsRequired();

            builder.Property(x => x.id_respuesta)
                .HasColumnName("id_respuesta");

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_invitado)
                .HasColumnName("id_invitado");

            builder.Property(x => x.token_consulta)
                .HasColumnName("token_consulta")
                .HasMaxLength(100);

            builder.Property(x => x.orden_ganador)
                .HasColumnName("orden_ganador");

            builder.Property(x => x.estado)
                .HasColumnName("estado")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.observaciones)
                .HasColumnName("observaciones");

            builder.Property(x => x.fecha_ganador)
                .HasColumnName("fecha_ganador")
                .IsRequired();

            builder.Property(x => x.fecha_entrega)
                .HasColumnName("fecha_entrega");

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.Property(x => x.qr_token_premio)
                .HasColumnName("qr_token_premio")
                .HasMaxLength(100);

            builder.Property(x => x.fecha_generacion_qr)
                .HasColumnName("fecha_generacion_qr");

            builder.Property(x => x.entregado_por_usuario)
                .HasColumnName("entregado_por_usuario");
        }
    }
}