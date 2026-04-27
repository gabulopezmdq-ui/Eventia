using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_hospedaje_tagsConfiguration : IEntityTypeConfiguration<ef_hospedaje_tags>
    {
        public void Configure(EntityTypeBuilder<ef_hospedaje_tags> builder)
        {
            builder.ToTable("ef_hospedaje_tags", "public");
            builder.HasKey(x => x.id_hospedaje_tag);

            builder.Property(x => x.id_hospedaje_tag).ValueGeneratedOnAdd();
            builder.Property(x => x.codigo).HasMaxLength(40).IsRequired();
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.orden).IsRequired().HasDefaultValue((short)1);

            builder.HasIndex(x => x.codigo).IsUnique();
            builder.HasIndex(x => new { x.activo, x.orden }).HasDatabaseName("ix_ef_hospedaje_tags_activo_orden");
        }
    }
}