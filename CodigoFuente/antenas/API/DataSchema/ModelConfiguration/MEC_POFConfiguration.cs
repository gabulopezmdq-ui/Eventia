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
                .HasOne(p => p.Establecimiento)
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.TipoFuncion) 
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdFuncion)
              .IsRequired(true);

            builder
                .Navigation(e => e.TipoFuncion)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.Persona)
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdPersona)
                .IsRequired(true);

            builder
                .Navigation(e => e.Persona)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(p => p.Categoria)
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdCategoria)
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

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder
                .HasOne(p => p.CarRevista)
                .WithMany(t => t.POFs)
                .HasForeignKey(p => p.IdCarRevista)
                .IsRequired(true);

            builder
                .Navigation(e => e.CarRevista)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }
}
