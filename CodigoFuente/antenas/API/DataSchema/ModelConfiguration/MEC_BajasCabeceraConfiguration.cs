using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_MotivosBajasConfiguration : IEntityTypeConfiguration<MEC_MotivosBajas>
    {
        public void Configure(EntityTypeBuilder<MEC_MotivosBajas> builder)
        {
            builder
                .HasKey(e => e.IdMotivoBaja);

            builder
                .Property(e => e.IdMotivoBaja)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.MotivoBaja)
                .HasColumnType("char(100)")
             .IsRequired(false);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true);
        }
    }
}
