using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_TMPEFIConfiguration : IEntityTypeConfiguration<MEC_TMPEFI>
    {
        public void Configure(EntityTypeBuilder<MEC_TMPEFI> builder)
        {
            builder
                .HasKey(k => k.IdTMPEFI);

            builder
                .Property(p => p.IdTMPEFI)
                .ValueGeneratedOnAdd();


            builder.HasOne(e => e.Cabecera)
               .WithMany(c => c.TMPEFI)   // <--- aquí la colección
               .HasForeignKey(e => e.IdCabecera)
               .HasConstraintName("fk_mec_tmpefi_cabecera")
               .OnDelete(DeleteBehavior.Restrict);

            // Forzar que EF Core no genere shadow property
            builder.Navigation(e => e.Cabecera)
                   .AutoInclude()
                   .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(e => e.Documento)
                .HasColumnType("varchar(8)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.Apellido)
                .HasColumnType("varchar(100)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.Nombre)
               .HasColumnType("varchar(100)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.Legajo)
               .HasColumnType("varchar(10)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.Secuencia)
               .HasColumnType("varchar(3)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.TipoCargo)
               .HasColumnType("varchar(1)")
               .IsFixedLength(true)
               .IsRequired(false);

            builder.Property(e => e.UE)
             .HasColumnType("varchar(20)")
             .IsFixedLength(true)
             .IsRequired(false);

            builder.Property(e => e.Caracter)
            .HasColumnType("varchar(50)")
            .IsFixedLength(true)
            .IsRequired(false);

            builder.Property(e => e.Cargo)
         .HasColumnType("varchar(50)")
         .IsFixedLength(true)
         .IsRequired(false);

            builder.Property(e => e.Funcion)
         .HasColumnType("varchar(1)")
         .IsFixedLength(true)
         .IsRequired(false);

            builder.Property(e => e.Barra)
             .IsFixedLength(true)
            .IsRequired(false);

            builder.Property(e => e.Estado)
            .HasColumnType("varchar(2)")
            .IsFixedLength(true)
            .IsRequired(false);
        }
    }
}
