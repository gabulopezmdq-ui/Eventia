using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_audiencia_persona_tagsConfiguration : IEntityTypeConfiguration<API.DataSchema.ef_audiencia_persona_tags>
    {
        public void Configure(EntityTypeBuilder<API.DataSchema.ef_audiencia_persona_tags> builder)
        {
            builder.ToTable("ef_audiencia_persona_tags", "public");

            builder.HasKey(x => x.id_audiencia_persona_tag);

            builder.Property(x => x.id_audiencia_persona_tag)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.id_audiencia_persona).IsRequired();
            builder.Property(x => x.tag_tipo).IsRequired().HasMaxLength(60);
            builder.Property(x => x.tag_valor).IsRequired().HasMaxLength(120);
            builder.Property(x => x.activo).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.fecha_alta).IsRequired().HasDefaultValueSql("now()");

            builder.HasOne(x => x.audiencia_persona)
                   .WithMany()
                   .HasForeignKey(x => x.id_audiencia_persona)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
