using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_tipos_identificacion_fiscalConfiguration : IEntityTypeConfiguration<ef_tipos_identificacion_fiscal>
    {
        public void Configure(EntityTypeBuilder<ef_tipos_identificacion_fiscal> builder)
        {
            builder.ToTable("ef_tipos_identificacion_fiscal", "public");

            builder.HasKey(x => x.id_tipo_identificacion_fiscal);

            builder.Property(x => x.id_tipo_identificacion_fiscal)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.id_pais)
                   .IsRequired();

            builder.Property(x => x.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(x => x.orden)
                   .IsRequired()
                   .HasDefaultValue((short)0);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.codigo, x.id_pais })
                   .IsUnique()
                   .HasDatabaseName("ux_ef_tif_codigo_pais");

            builder.HasIndex(x => x.id_pais)
                   .HasDatabaseName("ix_ef_tif_id_pais");

            builder.HasOne(x => x.pais)
                   .WithMany()
                   .HasForeignKey(x => x.id_pais)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}