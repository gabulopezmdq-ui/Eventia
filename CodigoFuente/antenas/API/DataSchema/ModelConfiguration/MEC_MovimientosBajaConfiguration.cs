using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MovimientosBajaConfiguration : IEntityTypeConfiguration<MEC_MovimientosBaja>
    {
        public void Configure(EntityTypeBuilder<MEC_MovimientosBaja> builder)
        {
            builder
                .HasKey(k => k.IdMovimientoBaja);

            builder
                .Property(p => p.IdMovimientoBaja)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.TipoEstablecimiento)
                .WithMany(t => t.MovimientosBaja)
                .HasForeignKey(p => p.IdTipoEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.TipoEstablecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
              .HasOne(p => p.POF)
              .WithMany(t => t.MovimientosBaja)
              .HasForeignKey(p => p.IdPOF)
              .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(p => p.Establecimiento)
               .WithMany(t => t.MovimientosBaja)
               .HasForeignKey(p => p.IdEstablecimiento)
               .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                 .HasOne(p => p.MotivoBajaDoc)
                 .WithMany(t => t.MovimientosBaja)
                 .HasForeignKey(p => p.IdMotivoBaja)
                 .IsRequired(true);

            builder
                .Navigation(e => e.MotivoBajaDoc)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Anio)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.SuplenteDNI)
              .HasColumnType("char(8)")
                .IsFixedLength(true)
              .IsRequired(false);


            builder.Property(e => e.SuplenteApellido)
                .HasColumnType("varchar(100)")
                .IsRequired(false);

            builder.Property(e => e.SuplenteNombre)
               .HasColumnType("varchar(100)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.FechaFin)
              .IsRequired(false);

            builder.Property(e => e.FechaInicio)
               .IsRequired(false);

            builder.Property(e => e.CantHoras)
               .HasColumnType("int")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.Estado)
              .HasColumnType("char(1)")
              .IsRequired(true);

            builder.Property(e => e.Ingreso)
              .HasColumnType("varchar(20)")
              .IsRequired(false);

            builder.Property(e => e.IngresoDescripcion)
             .HasColumnType("varchar(2)")
             .IsRequired(false);

            builder.Property(e => e.Observaciones)
               .HasColumnType("char(1000)")
               .IsFixedLength(true)
               .IsRequired(false);

        }
    }
}
