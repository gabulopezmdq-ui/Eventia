using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ANT_ExpedientesConfiguration :IEntityTypeConfiguration<ANT_Expedientes>
    {
        public void Configure(EntityTypeBuilder<ANT_Expedientes> builder)
        {
            builder
               .HasKey(k => k.IdExpediente);

            builder
                .Property(k => k.IdExpediente)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .HasOne(p => p.Antenas)
                .WithOne(e => e.Expediente)
                .HasForeignKey<ANT_Antenas>(e => e.IdAntena);

            builder
                .Navigation(e => e.Antenas)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);
            
            builder
                .Navigation(e => e.Antenas)
                .AutoInclude()
                .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder
                .Property(p => p.AcometidaEnergia)
                .IsRequired(true);

            builder
                .Property(p => p.ActaAsamblea)
                .IsRequired(true);

            builder
                .Property(p => p.AEnacom)
               
                .IsRequired(true);
            builder
                .Property(p => p.ANAC)
                .IsRequired(true);

            builder
                .Property(p => p.CertificadoDominio)
                .IsRequired(true);

            builder
                .Property(p => p.CompromisoDesmonte)
                .IsRequired(true);

            builder
                .Property(p => p.ConstanciaPago)
                .IsRequired(true);

            builder
                .Property(p => p.ContratoLocacion)
                .IsRequired(true);

            builder
                .Property(p => p.ContratoRepresentante)
                .IsRequired(true);

            builder
                .Property(p => p.ContratoResponsableSH)
                .IsRequired(true);

            builder
                .Property(p => p.CopiaConvenioCNC)
                .IsRequired(true);

            builder
                .Property(p => p.CronogramaObra)
                .IsRequired(true);

            builder
                .Property(p => p.CuadroPotencia)
                .IsRequired(true);

            builder
                .Property(p => p.CuadroVerifConduc)
                .IsRequired(true);

            builder
                .Property(p => p.FactAmbienteBA)
                .IsRequired(true);

            //cambiar fechas a TRUE 
            builder
                .Property(p => p.FechaEmision)
                .IsRequired(true);

            builder
                .Property(p => p.FechaTasaA)
                .IsRequired(true);

            builder
                .Property(p => p.ImpactoAmbiental)
                .IsRequired(true);

            builder
                .Property(p => p.LayoutElectrica)
                .IsRequired(true);

            builder
                .Property(p => p.LibreDeuda)
                .IsRequired(true);

            builder
                .Property(p => p.MedicionRadiacion)
                .IsRequired(true);

            builder
                .Property(p => p.MemoriaCalculo)
                .IsRequired(true);

            builder
                .Property(p => p.NombreExp)
                .IsRequired(true);

            builder
                .Property(p => p.NroExpediente)
                .IsRequired(true);

            builder
                .Property(p => p.Observaciones)
                .IsRequired(true);

            builder
                .Property(p => p.OrdenamientoTerritorial)
                .IsRequired(true);

            builder
                .Property(p => p.PermisoAmbiental)
                .IsRequired(true);

            builder
                .Property(p => p.PlanoCivil)
                .IsRequired(true);

            builder
                .Property(p => p.PlanoConstruccion)
                .IsRequired(true);

            builder
                .Property(p => p.Planos)
                .IsRequired(true);

            builder
                .Property(p => p.PoderTramite)
                .IsRequired(true);

            builder
                .Property(p => p.PolizaSeguroCT)
                .IsRequired(true);

            builder
                .Property(p => p.RegistroDGOP)
                .IsRequired(true);

            builder
                .Property(p => p.ReglamentoCopropiedad)
                .IsRequired(true);

            builder
                .Property(p => p.SeguridadHigiene)
                .IsRequired(true);

            builder
                .Property(p => p.SeguroRespCivil)
                .IsRequired(true);

            builder
                .Property(p => p.SistBaliza)
                .IsRequired(true);

            builder
                .Property(p => p.SistProtAtmos)
                .IsRequired(true);

            builder
                .Property(p => p.SistPuestaTierra)
                .IsRequired(true);

            builder
                .Property(p => p.TasaAnual)
                .IsRequired(true);

            builder
                .Property(p => p.TasaSigem)
                .IsRequired(true);

            builder
                .Property(p => p.UnifiliarGral)
                .IsRequired(true);
        }
    }
}
