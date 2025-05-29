using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MecanizadasConfiguration : IEntityTypeConfiguration<MEC_Mecanizadas>
    {
        public void Configure(EntityTypeBuilder<MEC_Mecanizadas> builder)
        {
            builder
                .HasKey(k => k.IdMecanizada);

            builder
                .Property(p => p.IdMecanizada)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(p => p.Cabecera)
                .WithMany(t => t.Mecanizadas)
                .HasForeignKey(p => p.IdCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.Usuario) 
                .WithMany(t => t.Mecanizadas)
                .HasForeignKey(p => p.IdUsuario)
              .IsRequired(false);

            builder
                .Navigation(e => e.Usuario)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.Establecimiento)
                .WithMany(t => t.Mecanizada)
                .HasForeignKey(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.POF)
                .WithMany(t => t.Mecanizada)
                .HasForeignKey(p => p.IdPOF)
                .IsRequired(true);

            builder
                .Navigation(e => e.POF)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);



            builder.Property(e => e.FechaConsolidacion)
                .IsRequired(false); 

            builder.Property(e => e.MesLiquidacion)
                .HasColumnType("char(6)")
                .IsFixedLength(true)
                .IsRequired(false); 

            builder.Property(e => e.OrdenPago)
                .HasColumnType("char(5)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.AnioMesAfectacion)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.CodigoLiquidacion)
            .HasColumnType("char(4)")
            .IsFixedLength(true)
            .IsRequired(false);

            builder.Property(e => e.Importe)
           .IsRequired(false);

            builder.Property(e => e.Signo)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.MarcaTransferido)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Moneda)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.RegimenEstatutario)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Dependencia)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Distrito)
           .HasColumnType("char(3)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Subvencion)
           .HasColumnType("char(3)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Origen)
           .HasColumnType("char(3)")
           .IsFixedLength(true)
           .IsRequired(false);

            builder.Property(e => e.Consolidado)
           .HasColumnType("char(1)")
           .IsFixedLength(true)
           .IsRequired(false);
        }
    }
}
