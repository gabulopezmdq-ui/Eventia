using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_ConceptosConfiguration : IEntityTypeConfiguration<MEC_Conceptos>
    {
        public void Configure(EntityTypeBuilder<MEC_Conceptos> builder)
        {
            builder
                .HasKey(k => k.IdConcepto);

            builder
                .Property(p => p.IdConcepto)
                .ValueGeneratedOnAdd();
                

            builder.Property(e => e.CodConcepto)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(); // si quieres que sea NOT NULL

            builder.Property(e => e.CodConceptoMgp)
                .HasColumnType("varchar(10)")
                .IsFixedLength(false)
                .IsRequired(false); // si quieres que sea NOT NULL

            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(50)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.ConAporte)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.Patronal)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.DevolucionSalario)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 
        }
    }
}
