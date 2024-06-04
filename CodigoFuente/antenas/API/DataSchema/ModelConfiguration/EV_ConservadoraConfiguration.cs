using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_ConservadoraConfiguration : IEntityTypeConfiguration<EV_Conservadora>
    {
        public void Configure(EntityTypeBuilder<EV_Conservadora> builder) 
        {
            builder
               .HasKey(k => k.IdConservadora);
            
            builder
                .Property(p => p.IdConservadora)
                .ValueGeneratedOnAdd();
           
            builder
             .HasOne(e => e.EV_Seguro)
             .WithMany(e => e.EV_Conservadora)
             .HasForeignKey(e => e.IdSeguro)
             .IsRequired(false);

            builder
                .Navigation(e => e.EV_Seguro)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);


            builder
             .HasMany(e => e.EV_RepTecnico)
             .WithMany(e => e.EV_Conservadora);
             
            builder
                .Navigation(e => e.EV_RepTecnico)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);
        }
    }

}