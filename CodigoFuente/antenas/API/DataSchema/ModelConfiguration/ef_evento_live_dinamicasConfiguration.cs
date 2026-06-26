using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.ModelConfiguration
{
    public class ef_evento_live_dinamicasConfiguration : IEntityTypeConfiguration<ef_evento_live_dinamicas>
    {
        public void Configure(EntityTypeBuilder<ef_evento_live_dinamicas> builder)
        {
            builder.ToTable("ef_evento_live_dinamicas");
            builder.HasKey(x => x.id_dinamica);
            builder.Property(x => x.codigo).HasMaxLength(80).IsRequired();
            builder.Property(x => x.titulo).HasMaxLength(150).IsRequired();
            builder.Property(x => x.tipo_dinamica).HasMaxLength(40).IsRequired();
            builder.Property(x => x.estado).HasMaxLength(40).IsRequired();
            builder.Property(x => x.modo_premio).HasMaxLength(50).IsRequired();

            builder.Property(x => x.es_copia)
                .HasDefaultValue(false);

            builder.Property(x => x.id_dinamica_origen);
            
            builder.Property(x => x.es_plantilla)
                .HasDefaultValue(false);


            builder.HasOne<ef_evento_live_dinamicas>()
                .WithMany()
                .HasForeignKey(x => x.id_dinamica_origen)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.config_json).HasColumnType("jsonb");
        }
    }
}