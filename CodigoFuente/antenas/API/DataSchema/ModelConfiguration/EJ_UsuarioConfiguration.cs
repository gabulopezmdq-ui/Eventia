using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class EJ_UsuarioConfiguration : IEntityTypeConfiguration<EJ_Usuario>
    {
        public void Configure(EntityTypeBuilder<EJ_Usuario> builder) 
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