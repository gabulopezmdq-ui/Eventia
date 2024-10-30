using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_RolesXUsuariosConfiguration : IEntityTypeConfiguration<MEC_RolesXUsuarios>
    {
        public void Configure(EntityTypeBuilder<MEC_RolesXUsuarios> builder) 
        {
            builder
               .HasKey(k => k.IdRolXUsuario);

            builder
                .Property(k => k.IdRolXUsuario)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
               .HasOne(e => e.Usuario)
               .WithMany(e => e.UsuariosXRoles)
               .HasForeignKey(e => e.IdUsuario)
               .IsRequired(true);

            builder
                .Navigation(e => e.Usuario)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(e => e.Rol)
               .WithMany(e => e.RolesXUsuarios)
               .HasForeignKey(e => e.IdRol)
               .IsRequired(true);

            builder
                .Navigation(e => e.Rol)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }

}