using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_EstablecimientosConfiguration : IEntityTypeConfiguration<MEC_Establecimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_Establecimientos> builder)
        {
            builder
                .HasKey(k => k.IdEstablecimiento);

            builder
                .Property(p => p.IdEstablecimiento)
                .ValueGeneratedOnAdd();

            builder
                .HasOne(e => e.TipoEstablecimientos)
                .WithMany(e => e.Establecimientos)
                .HasForeignKey(e => e.IdTipoEstablecimiento)
                .IsRequired(true);

            builder
                .Navigation(e => e.TipoEstablecimientos)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.NroDiegep)
                .HasColumnType("char(4)")
                .IsFixedLength(true)
                .IsRequired(true); 

            builder.Property(e => e.NroEstablecimiento)
                .HasColumnType("varchar(50)")
                .IsFixedLength(false)
                .IsRequired(true); 

            builder.Property(e => e.NombreMgp)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.NombrePcia)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.NombrePcia)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false)
                .IsRequired(true);

            builder.Property(e => e.Domicilio)
                .HasColumnType("varchar(100)")
                .IsFixedLength(false);

            builder.Property(e => e.Telefono)
                .HasColumnType("varchar(50)")
                .IsFixedLength(false);

            builder.Property(e => e.UE)
                .HasColumnType("varchar(20)")
                .IsFixedLength(false);

            builder.Property(e => e.CantSecciones)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.CantTurnos)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Ruralidad)
                .HasColumnType("char(2)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Subvencion)
                .HasColumnType("char(3)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 
        }
    }
}
