using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class ANT_UsuarioConfiguration : IEntityTypeConfiguration<ANT_Usuario>
    {
        public void Configure(EntityTypeBuilder<ANT_Usuario> builder) 
        {
            builder
               .HasKey(k => k.IdUsuario);

            builder
                .Property(p => p.IdUsuario)
                .ValueGeneratedOnAdd();
            
            builder
                .Property(p => p.Nombre)
                .IsRequired(false);
        }
    }

}