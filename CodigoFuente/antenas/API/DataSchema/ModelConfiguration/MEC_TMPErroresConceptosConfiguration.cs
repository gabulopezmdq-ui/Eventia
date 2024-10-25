//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;

//namespace API.DataSchema.ModelConfiguration
//{
//    public class MEC_TMPErroresConceptosConfiguration : IEntityTypeConfiguration<MEC_TMPErroresConceptos>
//    {
//        public void Configure(EntityTypeBuilder<MEC_TMPErroresConceptos> builder)
//        {
//            builder
//                .HasKey(k => k.IdTMPErrorConcepto);

//            builder
//                .Property(p => p.IdTMPErrorConcepto)
//                .ValueGeneratedOnAdd();

//            builder
//                .HasOne(e => e.Cabecera)
//                .WithOne()
//                .HasForeignKey<MEC_CabeceraLiquidacion>(e => e.IdCabecera)
//                .IsRequired(true);

//            builder
//                .Navigation(e => e.Cabecera)
//                .AutoInclude()
//                .UsePropertyAccessMode(PropertyAccessMode.Property);

//            builder.Property(e => e.CodigoLiquidacion)
//                .HasColumnType("varchar(20)")
//                .IsFixedLength(true)
//                .IsRequired(false); 
//        }
//    }
//}
