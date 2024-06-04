using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_PersonaConfiguration : IEntityTypeConfiguration<EV_Persona>
    {
        public void Configure(EntityTypeBuilder<EV_Persona> builder) 
        {
            builder
               .HasKey(k => k.IdPersona);

            builder
                .Property(p => p.IdPersona)
                .ValueGeneratedOnAdd();

        }
    }

}