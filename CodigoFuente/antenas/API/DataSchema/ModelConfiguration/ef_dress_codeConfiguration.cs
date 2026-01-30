using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_dress_codeConfiguration : IEntityTypeConfiguration<ef_dress_code>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_dress_code> builder)
        {
            builder.ToTable("ef_dress_code", "public");

            builder.HasKey(x => x.id_dress_code);

            builder.Property(x => x.id_dress_code)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.HasIndex(x => x.codigo)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_dress_code_codigo");
        }
    }
}
