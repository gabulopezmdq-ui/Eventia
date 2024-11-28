using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace API.DataSchema.ModelConfiguration
{
    public class MEC_UsuariosEstablecimientosConfiguration : IEntityTypeConfiguration<MEC_UsuariosEstablecimientos>
    {
        public void Configure(EntityTypeBuilder<MEC_UsuariosEstablecimientos> builder)
        {
            builder
                .HasKey(k => k.IdUsuarioEstablecimiento);

            builder
                .Property(p => p.IdUsuario)
                .IsRequired(true);

            builder
                .Property(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Property(p => p.IdCargo)
                .IsRequired(true);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);
        }
    }
}
