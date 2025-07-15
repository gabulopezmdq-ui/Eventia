using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TiposCategoriasConfiguration : IEntityTypeConfiguration<MEC_TiposCategorias>
    {
        public void Configure(EntityTypeBuilder<MEC_TiposCategorias> builder)
        {
            builder
                .HasKey(k => k.IdTipoCategoria);

            builder
                .Property(p => p.IdTipoCategoria)
                .ValueGeneratedOnAdd();
                

            builder.Property(e => e.CodCategoria)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true); // si quieres que sea NOT NULL

            builder.Property(e => e.CodCategoriaMGP)
                .HasColumnType("varchar(10)")
                .IsFixedLength(false);

            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.TipoCargo)
                .HasColumnType("char(1)")
                .IsFixedLength(false)
                .IsRequired(false);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

        }
    }
}
