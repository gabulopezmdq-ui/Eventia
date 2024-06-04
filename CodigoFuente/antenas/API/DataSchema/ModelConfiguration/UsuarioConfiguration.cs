using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder) 
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