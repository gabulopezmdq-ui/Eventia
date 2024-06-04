using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;
using System.Reflection.Metadata;

namespace rsAPIElevador.DataSchema
{
    public class EV_AdministracionConfiguration : IEntityTypeConfiguration<EV_Administracion>
    {
        public void Configure(EntityTypeBuilder<EV_Administracion> builder) 
        {
            builder
               .HasKey(k => k.IdAdministracion);
            
            builder
                .Property(p => p.IdAdministracion)
                .ValueGeneratedOnAdd();

            builder
                .HasMany(e => e.EV_Conservadora)
                .WithMany(e => e.EV_Administracion);

            builder
                .Navigation(e => e.EV_Conservadora)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

        }
    }

}