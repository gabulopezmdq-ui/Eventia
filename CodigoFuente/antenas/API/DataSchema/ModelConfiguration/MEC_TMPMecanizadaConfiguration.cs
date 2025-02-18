using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPMecanizadaConfiguration : IEntityTypeConfiguration<MEC_TMPMecanizadas>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPMecanizadas> builder)
        {
            builder
                .HasKey(k => k.idTMPMecanizada);

            builder
                .Property(p => p.idTMPMecanizada)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.Cabecera)
                .WithOne()
                .HasForeignKey<MEC_CabeceraLiquidacion>(e => e.IdCabecera)
                .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
    .HasMany(e => e.TMPErroresMecanizadas)
    .WithOne(e => e.TMPMecanizada)
    .HasForeignKey(e => e.IdTMPMecanizada)
    .IsRequired(true);

            builder
                .Navigation(e => e.Cabecera)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);



            builder.Property(e => e.FechaImportacion)
                .HasColumnType("DateTime")
                .IsFixedLength(true)
                .IsRequired(false); 

            builder.Property(e => e.MesLiquidacion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(false); 

            builder.Property(e => e.OrdenPago)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.AnioMesAfectacion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.Documento)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.Secuencia)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Funcion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.CodigoLiquidacion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.Importe)
               .HasColumnType("decimal")
               .IsFixedLength(true)
               .IsRequired(true);
            builder.Property(e => e.Signo)
               .HasColumnType("varchar(20)")
               .IsFixedLength(true)
               .IsRequired(true);
            builder.Property(e => e.MarcaTransferido)
               .HasColumnType("varchar(20)")
               .IsFixedLength(true)
               .IsRequired(true);
            builder.Property(e => e.Moneda)
               .HasColumnType("varchar(20)")
               .IsFixedLength(true)
               .IsRequired(true);
            builder.Property(e => e.RegimenEstatutario)
             .HasColumnType("varchar(20)")
             .IsFixedLength(true)
             .IsRequired(true);
            builder.Property(e => e.CaracterRevista)
             .HasColumnType("varchar(20)")
             .IsFixedLength(true)
             .IsRequired(true);
           
            builder.Property(e => e.Dependencia)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.Distrito)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.TipoOrganizacion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.NroEstab)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.Categoria)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.TipoCargo)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.HorasDesignadas)
                .HasColumnType("decimal")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.Subvencion)
                .HasColumnType("varchar(20)")
                .IsFixedLength(true)
                .IsRequired(true);
            builder.Property(e => e.RegistroValido)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);
        }
    }
}
