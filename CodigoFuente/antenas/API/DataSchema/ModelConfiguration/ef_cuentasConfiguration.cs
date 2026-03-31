using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_cuentasConfiguration : IEntityTypeConfiguration<ef_cuentas>
    {
        public void Configure(EntityTypeBuilder<ef_cuentas> builder)
        {
            builder.ToTable("ef_cuentas", "public");

            builder.HasKey(x => x.id_cuenta);

            builder.Property(x => x.id_cuenta)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.nombre_cuenta)
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(x => x.tipo)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.estado)
                   .HasMaxLength(1)
                   .IsRequired()
                   .HasDefaultValue("P");

            builder.Property(x => x.id_plan)
                   .IsRequired(false);

            builder.Property(x => x.instagram)
                   .HasMaxLength(100)
                   .IsRequired(false);

            builder.Property(x => x.web)
                   .HasMaxLength(200)
                   .IsRequired(false);

            builder.Property(x => x.telefono)
                   .HasMaxLength(30)
                   .IsRequired(false);

            builder.Property(x => x.ciudad)
                   .HasMaxLength(100)
                   .IsRequired(false);

            builder.Property(x => x.id_pais)
                   .IsRequired(false);

            builder.Property(x => x.id_tipo_identificacion_fiscal)
                   .IsRequired(false);

            builder.Property(x => x.identificacion_fiscal)
                   .HasMaxLength(30)
                   .IsRequired(false);

            builder.Property(x => x.descripcion)
                   .HasMaxLength(500)
                   .IsRequired(false);

            builder.Property(x => x.fecha_alta)
                   .IsRequired()
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.nombre_cuenta)
                   .IsUnique()
                   .HasDatabaseName("ux_ef_cuentas_nombre");

            builder.HasIndex(x => x.id_plan)
                   .HasDatabaseName("ix_ef_cuentas_id_plan");

            builder.HasIndex(x => x.id_pais)
                   .HasDatabaseName("ix_ef_cuentas_id_pais");

            builder.HasIndex(x => x.id_tipo_identificacion_fiscal)
                   .HasDatabaseName("ix_ef_cuentas_id_tipo_identificacion_fiscal");

            builder.HasOne(x => x.plan)
                   .WithMany()
                   .HasForeignKey(x => x.id_plan)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.pais)
                   .WithMany()
                   .HasForeignKey(x => x.id_pais)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.tipo_identificacion_fiscal)
                   .WithMany()
                   .HasForeignKey(x => x.id_tipo_identificacion_fiscal)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}