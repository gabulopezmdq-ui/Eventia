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
               .Property(e => e.IdUsuarioEstablecimiento)
               .ValueGeneratedOnAdd();
            builder
                .Property(p => p.IdUsuario)
                .IsRequired(true);

            builder
                .Property(p => p.IdEstablecimiento)
                .IsRequired(true);

            builder
                .Property(p => p.IdTipoCategoria)
                .IsRequired(true);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder
                .HasOne(p => p.Usuario)
                .WithMany(t => t.UsXEstablecimiento)
                .HasForeignKey(p => p.IdUsuario)
                .IsRequired(true);

            builder
                .Navigation(e => e.Usuario)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(p => p.Establecimiento)
               .WithMany(t => t.UsuarioEstablecimiento)
               .HasForeignKey(p => p.IdEstablecimiento)
               .IsRequired(true);

            builder
                .Navigation(e => e.Establecimiento)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
               .HasOne(p => p.Cargo)
               .WithMany(t => t.UsuarioEstablecimiento)
               .HasForeignKey(p => p.IdTipoCategoria)
               .IsRequired(true);

            builder
                .Navigation(e => e.Cargo)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);
        }
    }
}
