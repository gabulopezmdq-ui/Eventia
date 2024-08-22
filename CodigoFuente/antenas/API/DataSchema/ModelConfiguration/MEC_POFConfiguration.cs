using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_POFConfiguration : IEntityTypeConfiguration<MEC_POF>
    {
        public void Configure(EntityTypeBuilder<MEC_POF> builder)
        {
            builder
                .HasKey(k => k.IdPOF);

            builder
                .Property(p => p.IdPOF)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.Establecimiento)
                .WithOne()
                .HasForeignKey<MEC_Establecimientos>(e => e.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.Persona)
                .WithOne()
                .HasForeignKey<MEC_Personas>(e => e.IdPersona)
                .IsRequired(true);

            builder
                .Navigation(e => e.Persona)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.Categoria)
                .WithOne()
                .HasForeignKey<MEC_TiposCategorias>(e => e.IdTipoCategoria)
                .IsRequired(true);

            builder
                .Navigation(e => e.Categoria)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Secuencia)
                .HasColumnType("char(3)")
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.Barra)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(false); 

            builder.Property(e => e.TipoCargo)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.CantHsCargo)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.AntigAnios)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true);
            
            builder.Property(e => e.AntigMeses)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.SinHaberes)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Subvencionada)
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
