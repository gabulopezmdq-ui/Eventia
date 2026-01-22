using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_eventosConfiguration : IEntityTypeConfiguration<ef_eventos>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_eventos> builder)
        {
            builder.ToTable("ef_eventos", "public");

            builder.HasKey(x => x.id_evento);

            builder.Property(x => x.id_evento)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_tipo_evento)
                   .IsRequired();

            builder.Property(x => x.id_idioma)
                   .IsRequired();

            builder.Property(x => x.id_cliente);

            builder.Property(x => x.anfitriones_texto)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.Property(x => x.fecha_hora)
                   .IsRequired();

            builder.Property(x => x.lugar)
                   .HasMaxLength(200);

            builder.Property(x => x.direccion)
                   .HasMaxLength(200);

            builder.Property(x => x.latitud)
                   .HasPrecision(9, 6);

            builder.Property(x => x.longitud)
                   .HasPrecision(9, 6);

            builder.Property(x => x.id_dress_code);

            builder.Property(x => x.dress_code_descripcion)
                   .HasMaxLength(200);

            builder.Property(x => x.saludo)
                   .HasMaxLength(500);

            builder.Property(x => x.mensaje_bienvenida)
                   .HasMaxLength(500);

            builder.Property(x => x.notas)
                   .HasMaxLength(500);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .HasDefaultValue("B")
                   .IsUnicode(false);

            // CHECK constraints (igual que en la BD)
            builder.HasCheckConstraint(
                "ck_ef_eventos_lat",
                "(latitud is null) or (latitud >= -90 and latitud <= 90)"
            );

            builder.HasCheckConstraint(
                "ck_ef_eventos_lng",
                "(longitud is null) or (longitud >= -180 and longitud <= 180)"
            );

            // Relaciones (FKs)
            builder.HasOne(x => x.tipo_evento)
                   .WithMany()
                   .HasForeignKey(x => x.id_tipo_evento)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.idioma)
                   .WithMany()
                   .HasForeignKey(x => x.id_idioma)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.dress_code)
                   .WithMany()
                   .HasForeignKey(x => x.id_dress_code)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.cliente)
                   .WithMany()
                   .HasForeignKey(x => x.id_cliente)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
