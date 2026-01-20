//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;

//namespace API.DataSchema.ModelConfiguration
//{
//    public class MEC_TiposFuncionesConfiguration : IEntityTypeConfiguration<MEC_TiposFunciones>
//    {
//        public void Configure(EntityTypeBuilder<MEC_TiposFunciones> builder)
//        {
//            builder
//                .HasKey(k => k.IdTipoFuncion);

//            builder
//                .Property(p => p.IdTipoFuncion)
//                .ValueGeneratedOnAdd();
                

//            builder.Property(e => e.CodFuncion)
//                .HasColumnType("char(1)")
//                .IsFixedLength(true)
//                .IsRequired(true); // si quieres que sea NOT NULL

//            builder.Property(e => e.CodFuncionMGP)
//                .HasColumnType("varchar(10)")
//                .IsFixedLength(false);

//            builder.Property(e => e.Descripcion)
//                .HasColumnType("varchar(100)")
//                .IsFixedLength(false)
//                .IsRequired(true); 

//            builder.Property(e => e.Vigente)
//                .HasColumnType("char(1)")
//                .IsFixedLength(true)
//                .IsRequired(true); 

//        }
//    }
//}
