using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace rsAPIElevador.DataSchema
{
    public class EV_SeguroConfiguration : IEntityTypeConfiguration<EV_Seguro>
    {
        public void Configure(EntityTypeBuilder<EV_Seguro> builder) 
        {
            builder
               .HasKey(k => k.IdSeguro);
            
            builder
                .Property(p => p.IdSeguro)
                .ValueGeneratedOnAdd();
        }
    }

}