using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MotivosBajasDocConfiguration : IEntityTypeConfiguration<MEC_MotivosBajasDoc>
    {
        public void Configure(EntityTypeBuilder<MEC_MotivosBajasDoc> builder)
        {
            builder
               .HasKey(k => k.IdMotivoBaja);

            builder
                .Property(p => p.IdMotivoBaja)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.MotivoBaja)
                .IsRequired(true);

            builder
               .Property(p => p.Vigente)
               .HasColumnType("char(1)")
               .IsFixedLength(true);
        }
    }
}
