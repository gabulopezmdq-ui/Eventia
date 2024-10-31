using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_CabeceraLiquidacionConfiguration : IEntityTypeConfiguration<MEC_CabeceraLiquidacion>
    {
        public void Configure(EntityTypeBuilder<MEC_CabeceraLiquidacion> builder)
        {
            builder
                .HasKey(e => e.IdCabecera);

            builder
                .Property(e => e.IdCabecera)
                .ValueGeneratedOnAdd();

            builder
           .HasOne(e => e.Usuarios)
           .WithMany()
           .HasForeignKey(e => e.Usuarios)
           .IsRequired(true);

            builder
               .Navigation(e => e.Usuarios)
               .AutoInclude(true)
               .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .HasOne(e => e.TipoLiquidacion)
                .WithMany(e => e.CabeceraLiquidacion)
                .HasForeignKey(e => e.idTipoLiquidacion)
                .IsRequired(true);

            builder
                .Navigation(e => e.TipoLiquidacion)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.MesLiquidacion)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.AnioLiquidacion)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(false); 

            builder.Property(e => e.Usuario)
                .IsRequired(true);

            builder.Property(e => e.Observaciones)
                .HasColumnType("varchar(1000)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.InicioLiquidacion)
                .HasColumnType("DateTime")
                .IsFixedLength(true);
            
            builder.Property(e => e.FinLiquidacion)
                .HasColumnType("DateTime")
                .IsFixedLength(true);

            builder.Property(e => e.Estado)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

          

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 
        }
    }
}
