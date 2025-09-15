using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MovimientosDetalleConfiguration : IEntityTypeConfiguration<MEC_MovimientosDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_MovimientosDetalle> builder)
        {
            builder
                .HasKey(k => k.IdMovimientoDetalle);

            builder
                .Property(p => p.IdMovimientoDetalle)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.MovimientoCabecera)
                .WithMany(t => t.MovimientosDetalle)
                .HasForeignKey(p => p.IdMovimientoCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.MovimientoCabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
              .HasOne(p => p.POF)
              .WithMany(t => t.MovimientosDetalle)
              .HasForeignKey(p => p.IdPOF)
              .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(p => p.TipoFuncion)
               .WithMany(t => t.MovimientosDetalle)
               .HasForeignKey(p => p.IdTipoFuncion)
               .IsRequired(true);

            builder
                .Navigation(e => e.TipoFuncion)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                 .HasOne(p => p.TipoCategoria)
                 .WithMany(t => t.MovimientosDetalle)
                 .HasForeignKey(p => p.IdTipoCategoria)
                 .IsRequired(true);

            builder
                .Navigation(e => e.TipoCategoria)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
              .HasOne(p => p.MotivosBajasDoc)
              .WithMany(t => t.MovimientosDetalle)
              .HasForeignKey(p => p.IdMotivoBaja)
              .IsRequired(true);

            builder
                .Navigation(e => e.MotivosBajasDoc)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.TipoDoc)
                .HasColumnType("char(1)")
                .IsRequired(true);

            builder.Property(e => e.TipoMovimiento)
              .HasColumnType("char(1)")
              .IsRequired(true);


            builder.Property(e => e.NumDoc)
                .HasColumnType("char(8)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Apellido)
               .HasColumnType("char(100)")
               .IsFixedLength(true)
               .IsRequired(true);

            builder.Property(e => e.Nombre)
              .HasColumnType("char(100)")
              .IsFixedLength(true)
              .IsRequired(true);

            builder.Property(e => e.SitRevista)
             .HasColumnType("char(2)")
             .IsFixedLength(true)
             .IsRequired(false);

            builder.Property(e => e.Turno)
               .HasColumnType("char(1)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.AntigAnios)
              .HasColumnType("int")
              .IsRequired(false);

            builder.Property(e => e.AntigMeses)
              .HasColumnType("int")
              .IsRequired(false);

            builder.Property(e => e.Horas)
              .HasColumnType("int")
              .IsRequired(false);

            builder.Property(e => e.FechaFinBaja)
              .IsRequired(true);

            builder.Property(e => e.FechaInicioBaja)
              .IsRequired(true);

            builder.Property(e => e.Observaciones)
               .HasColumnType("char(1000)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.HorasDecrece)
             .HasColumnType("int")
             .IsRequired(false);

            builder.Property(e => e.Decrece)
             .HasColumnType("char(1)")
             .IsFixedLength(true)
             .IsRequired(false);

        }
    }
}
