using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_staffConfiguration : IEntityTypeConfiguration<ef_evento_staff>
    {
        public void Configure(EntityTypeBuilder<ef_evento_staff> builder)
        {
            builder.ToTable("ef_evento_staff", "public");

            builder.HasKey(x => x.id_evento_staff);

            builder.Property(x => x.id_evento_staff)
                .HasColumnName("id_evento_staff")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .HasColumnName("id_evento")
                .IsRequired();

            builder.Property(x => x.id_staff)
                .HasColumnName("id_staff")
                .IsRequired();

            builder.Property(x => x.id_rol)
                .HasColumnName("id_rol")
                .IsRequired();

            builder.Property(x => x.activo)
                .HasColumnName("activo")
                .IsRequired();

            builder.Property(x => x.fecha_alta)
                .HasColumnName("fecha_alta")
                .HasDefaultValueSql("now()")
                .IsRequired();

            builder.Property(x => x.fecha_modif)
                .HasColumnName("fecha_modif");

            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.staff)
                .WithMany()
                .HasForeignKey(x => x.id_staff)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.rol)
                .WithMany()
                .HasForeignKey(x => x.id_rol)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.id_evento, x.id_staff, x.id_rol })
                .IsUnique()
                .HasDatabaseName("ux_ef_evento_staff_evento_staff_rol");
        }
    }
}