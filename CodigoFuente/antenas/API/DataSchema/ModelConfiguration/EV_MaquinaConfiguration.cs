using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Hosting;
using System.Reflection.Emit;

namespace rsAPIElevador.DataSchema
{
    public class EV_MaquinaConfiguration : IEntityTypeConfiguration<EV_Maquina>
    {
        public void Configure(EntityTypeBuilder<EV_Maquina> builder) 
        {
            builder
               .HasKey(k => k.IdMaquina);
            
            builder
                .Property(p => p.IdMaquina)
                .ValueGeneratedOnAdd();

            builder
             .HasOne(e => e.EV_Obra)
             .WithMany(e => e.EV_Maquina)
             .HasForeignKey(e => e.IdObra)
             .IsRequired(false);

            builder
           .HasOne(e => e.EV_TipoEquipamiento)
           .WithMany(e => e.EV_Maquina)
           .HasForeignKey(e => e.IdTipoEquipamiento)
           .IsRequired(false);

            builder
                .Navigation(e => e.EV_TipoEquipamiento)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.Property);
            
            builder
              .HasOne(e => e.EV_Conservadora)
              .WithMany(e => e.EV_Maquina)
              .HasForeignKey(e => e.IdConservadora)
              .IsRequired(false);
      
            builder
              .HasOne(e => e.EV_Velocidades)
              .WithMany(e => e.EV_Maquina)
              .HasForeignKey(e => e.IdVelocidad)
              .IsRequired(false);

            builder
                .Navigation(e => e.EV_Velocidades)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
              .HasOne(e => e.EV_RepTecnico)
              .WithMany(e => e.EV_Maquina)
              .HasForeignKey(e => e.IdRepTecnico)
              .IsRequired(false);
            builder
                .Navigation(e => e.EV_RepTecnico)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

        }
    }

}