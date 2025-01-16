using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_POFDetalleConfiguration : IEntityTypeConfiguration<MEC_POFDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_POFDetalle> builder)
        {
            builder
                .HasKey(k => k.IdPOFDetalle);

            builder
                .Property(p => p.IdPOFDetalle)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.Cabecera)
                .WithMany(t => t.POFDetalle)
                .HasForeignKey(p => p.IdCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.POF)
                .WithMany(t => t.POFDetalle)
                .HasForeignKey(p => p.IdPOF)
              .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.Suplencia)
                .WithMany(t => t.POFSuplencia)
                .HasForeignKey(p => p.SupleA)
                .IsRequired(true);

            builder
                .Navigation(e => e.Suplencia)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.CantHorasCS)
                .HasColumnType("decimal")
                .IsRequired(true); 

            builder.Property(e => e.CantHorasSS)
                .HasColumnType("decimal")
                .IsRequired(true); 

            builder.Property(e => e.AntiguedadAnios)
                .IsRequired(true);

            builder.Property(e => e.AntiguedadMeses)
                .IsRequired(true);

            builder.Property(e => e.SinHaberes)
                .HasColumnType("char(1)")
                .IsRequired(false);

            builder.Property(e => e.NoSubvencionado)
                .HasColumnType("char(1)")
                .IsRequired(false);

            builder.Property(e => e.SupleDesde)
                .HasColumnType("Date")
              .IsRequired(false);

            builder.Property(e => e.SupleHasta)
                .HasColumnType("Date")
                .IsRequired(false);
        }
    }
}
