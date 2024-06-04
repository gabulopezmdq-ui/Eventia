using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Hosting;

namespace rsAPIElevador.DataSchema
{
    public class EV_ObraConfiguration : IEntityTypeConfiguration<EV_Obra>
    {
        public void Configure(EntityTypeBuilder<EV_Obra> builder) 
        {
            builder
               .HasKey(k => k.IdObra);
            
            builder
                .Property(p => p.IdObra)
                .ValueGeneratedOnAdd();
            
            
            builder
                .HasMany(e => e.EV_Maquina)
                .WithOne(e => e.EV_Obra)
                .HasForeignKey(e => e.IdObra)
                .IsRequired(false);
            
            builder
                .Navigation(e => e.EV_Maquina)
                .AutoInclude()  
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.EV_Administracion)
                .WithMany(e => e.EV_Obra)
                .HasForeignKey(e => e.IdAdministacion)
                .IsRequired(false);

            builder
                .Navigation(e => e.EV_Administracion)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .HasOne(e => e.EV_TipoObra)
                .WithMany(e => e.EV_Obra)
                .HasForeignKey(e => e.IdTipoObra)
                .IsRequired(false);

            builder
                .Navigation(e => e.EV_TipoObra)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.Property);

        }
    }

}