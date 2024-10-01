using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema
{
    public class MEC_RolesConfiguration : IEntityTypeConfiguration<MEC_Roles>
    {
        public void Configure(EntityTypeBuilder<MEC_Roles> builder) 
        {
            builder
               .HasKey(k => k.IdRol);

            builder
                .Property(k => k.IdRol)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .Property(p => p.NombreRol)
               .HasColumnType("varchar(20)")
                .IsRequired(true);

            builder
               .Property(p => p.Vigente)
               .HasColumnType("char(1)")
               .IsFixedLength(true);
        }
    }

}