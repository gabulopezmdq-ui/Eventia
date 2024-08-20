using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_CarRevistaConfiguration : IEntityTypeConfiguration<MEC_CarRevista>
    {
        public void Configure(EntityTypeBuilder<MEC_CarRevista> builder)
        {
            builder
                .HasKey(k => k.IdCarRevista);

            builder
                .Property(p => p.IdCarRevista)
                .ValueGeneratedOnAdd();
                

            builder.Property(e => e.CodPcia)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(); // si quieres que sea NOT NULL

            builder.Property(e => e.CodMgp)
                .HasColumnType("varchar(10)")
                .IsFixedLength(false)
                .IsRequired(false); // si quieres que sea NOT NULL

            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(50)")
                .IsFixedLength(false)
                .IsRequired(true); // si quieres que sea NOT NULL

        }
    }
}
