using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_BajasCabeceraConfiguration : IEntityTypeConfiguration<MEC_BajasCabecera>
    {
        public void Configure(EntityTypeBuilder<MEC_BajasCabecera> builder)
        {
            builder
                .HasKey(e => e.IdBajaCabecera);

            builder
                .Property(e => e.IdCabecera)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.Cabecera)
                .WithMany(u => u.BajaCabecera)
                .HasForeignKey(e => e.IdCabecera)
                .IsRequired(true);

            builder
               .Navigation(e => e.Cabecera)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .HasOne(e => e.Establecimiento)
                .WithMany(u => u.BajaCabecera)
                .HasForeignKey(e => e.IdEstablecimiento)
                .IsRequired(true);

            builder
               .Navigation(e => e.Establecimiento)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
               .HasOne(e => e.Usuario)
               .WithMany(u => u.BajaCabecera)
               .HasForeignKey(e => e.Confecciono)
               .IsRequired(true);

            builder
               .Navigation(e => e.Usuario)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder.Property(e => e.Mes)
                .IsRequired(true);

            builder.Property(e => e.Anio)
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.FechaApertura)
                .HasColumnType("DateTime")
                .IsRequired(false);

            builder.Property(e => e.FechaEntrega)
                .HasColumnType("DateTime")
             .IsRequired(false);

            builder.Property(e => e.Observaciones)
                .HasColumnType("varchar(1000)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.SinNovedades)
                .HasColumnType("char(1)")
                .IsFixedLength(true);

            builder.Property(e => e.Estado)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);
        }
    }
}
