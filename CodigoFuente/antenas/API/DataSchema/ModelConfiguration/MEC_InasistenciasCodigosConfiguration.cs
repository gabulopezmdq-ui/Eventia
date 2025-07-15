using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class MEC_InasistenciasCodigosConfiguration : IEntityTypeConfiguration<MEC_InasistenciasCodigos>
    {
        public void Configure(EntityTypeBuilder<MEC_InasistenciasCodigos> builder)
        {
            builder
                .HasKey(k => k.IdInasistenciasCodigo);

            builder
                .Property(p => p.IdInasistenciasCodigo)
                .ValueGeneratedOnAdd();
                

            builder.Property(e => e.CodLicencia)
                .HasColumnType("char(3)")
                .IsFixedLength(true)
                .IsRequired(true);

            builder.Property(e => e.Descripcion)
                .HasColumnType("varchar(1000)")
                .IsFixedLength(false);

            builder.Property(e => e.CodPeriodo)
                .IsRequired(true);

            builder.Property(e => e.CodForma)
                .IsRequired(false);

            builder.Property(e => e.MesCierre)
                .IsRequired(false);

            builder.Property(e => e.CodUnidad)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.CodGrupo)
                .IsRequired(false);

            builder.Property(e => e.Habicorr)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(false);

            builder.Property(e => e.Certificado)
                .IsRequired(false);

            builder.Property(e => e.AltaEven)
                .IsRequired(false);

            builder.Property(e => e.CodAmbito)
                .IsRequired(false);

            builder.Property(e => e.CodTipo)
                .IsRequired(false);

            builder.Property(e => e.Solicitud)
                .IsRequired(false);

            builder.Property(e => e.DescNoved)
                .IsRequired(false);

            builder.Property(e => e.DescSaldo)
                .IsRequired(false);

            builder.Property(e => e.Vigente)
                .HasColumnType("char(1)")
                .IsFixedLength(true)
                .IsRequired(true); 

        }
    }
}
