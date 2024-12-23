using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_BajasDetalleConfiguration : IEntityTypeConfiguration<MEC_BajasDetalle>
    {
        public void Configure(EntityTypeBuilder<MEC_BajasDetalle> builder)
        {
            builder
                .HasKey(e => e.IdBajaDetalle);

            builder
                .Property(e => e.IdBajaDetalle)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.BajaCabecera)
                .WithMany(u => u.BajasDetalle)
                .HasForeignKey(e => e.IdBajasCabecera)
                .IsRequired(true);

            builder
               .Navigation(e => e.BajaCabecera)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
               .HasOne(e => e.POF)
               .WithMany(u => u.BajasDetalle)
               .HasForeignKey(e => e.IdPOF)
               .IsRequired(true);

            builder
               .Navigation(e => e.POF)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
             .HasOne(e => e.MotivoBaja)
             .WithMany(u => u.BajasDetalle)
             .HasForeignKey(e => e.IdMotivoBaja)
             .IsRequired(true);

            builder
               .Navigation(e => e.MotivoBaja)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
               .HasOne(e => e.Usuario)
               .WithMany(u => u.BajaDetalle)
               .HasForeignKey(e => e.UsuarioRechazo)
               .IsRequired(true);

            builder
               .Navigation(e => e.Usuario)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder.Property(e => e.FechaDesde)
                .HasColumnType("DateTime")
                .IsRequired(true);

            builder.Property(e => e.FechaHasta)
                .HasColumnType("DateTime")
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.CantHs)
                .IsRequired(false);

            builder.Property(e => e.CantMin)
             .IsRequired(false);

            builder.Property(e => e.Observaciones)
                .HasColumnType("varchar(500)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.EstadoRegistro)
                .HasColumnType("char(1)")
                .IsFixedLength(true);

            builder.Property(e => e.MotivoRechazo)
                .HasColumnType("char(1000)")
                .IsFixedLength(true)
                .IsRequired(true);
        }
    }
}
