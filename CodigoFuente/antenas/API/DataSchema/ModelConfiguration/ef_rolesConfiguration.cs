using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_rolesConfiguration : IEntityTypeConfiguration<ef_roles>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_roles> builder)
        {
            builder.ToTable("ef_roles");
              
            builder.HasKey(x => x.id_rol);

            builder.Property(x => x.id_rol)
                   .ValueGeneratedOnAdd();
              
            builder.Property(x => x.codigo)
                    .HasMaxLength(30)
                    .IsRequired();

            builder.Property(x => x.descripcion)
                    .HasMaxLength(200);

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();
        }
    }
}
