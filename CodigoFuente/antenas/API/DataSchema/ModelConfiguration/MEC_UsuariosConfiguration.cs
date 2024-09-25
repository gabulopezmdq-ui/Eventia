using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_UsuariosConfiguration : IEntityTypeConfiguration<MEC_Usuarios>
    {
        public void Configure(EntityTypeBuilder<MEC_Usuarios> builder) 
        {
            builder
               .HasKey(k => k.IdUsuario);

            builder
                .Property(p => p.IdUsuario)
                .ValueGeneratedOnAdd();
            
            builder
                .Property(p => p.Nombre)
                .IsRequired(false);

            builder
               .Property(p => p.Activo)
               .HasColumnType("char(1)")
               .IsFixedLength(true);
        }
    }

}