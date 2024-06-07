using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ANT_InspeccionesConfiguration:IEntityTypeConfiguration<ANT_Inspecciones>
    {
        public void Configure(EntityTypeBuilder<ANT_Inspecciones> builder)
        {

            builder
                .HasKey(k => k.IdInspeccion);

            builder
                .Property(k => k.IdInspeccion)
                .ValueGeneratedOnAdd()
                .IsRequired(true);

            builder
                .HasOne(e => e.Antena)
                .WithMany(e => e.Inspecciones)
                .HasForeignKey(e => e.Antena)
                .IsRequired(true);

            builder
                .Navigation(e => e.Antena)
                .AutoInclude(true)
                .UsePropertyAccessMode(PropertyAccessMode.FieldDuringConstruction);

            builder
                .Property(p => p.AlambradoPerimetral)
                .IsRequired(true);

            builder
                .Property(p => p.AnilloTierra)
                .IsRequired(true);
            builder
                .Property(p => p.BalizaFlash)
                .IsRequired(true);

            builder
                .Property(p => p.BarraEquipos)
                .IsRequired(true);

            builder
                .Property(p => p.BarraEstructura)
                .IsRequired(true);
            builder
                .Property(p => p.BaseConcreto)
                .IsRequired(true);

            builder
                .Property(p => p.BaseConcretoPrin)
                .IsRequired(true);
            builder
                .Property(p => p.Bulones)
                .IsRequired(true);

            builder
                .Property(p => p.CableAlimentacion)
                .IsRequired(true);

            builder
                .Property(p => p.CableDescarga)
                .IsRequired(true);

            builder
                .Property(p => p.CamaraInspeccion)
                .IsRequired(true);

            builder
                .Property(p => p.CamaraPararrayos)
                .IsRequired(true);

            builder
                .Property(p => p.CamarasInspec)
                .IsRequired(true);

            builder
                .Property(p => p.CamarasPase)
                .IsRequired(true);

            builder
                .Property(p => p.CanalPilar)
                .IsRequired(true);

            builder
                .Property(p => p.ConexionBarra)
                .IsRequired(true);

            builder
                .Property(p => p.ConexionChasis)
                .IsRequired(true);

            builder
                .Property(p => p.ConexionEstAnillo)
                .IsRequired(true);

            builder
                .Property(p => p.ConexionTierra)
                .IsRequired(true);

            builder
                .Property(p => p.Desmalezado)
                .IsRequired(true);

            builder
                .Property(p => p.DesplaFisuras)
                .IsRequired(true);

            builder
                .Property(p => p.ErosionTerreno)
                .IsRequired(true);

            builder
                .Property(p => p.EscaleraGuarda)
                .IsRequired(true);

            builder
                .Property(p => p.EstadoFotocelula)
                .IsRequired(true);

            builder
                .Property(p => p.EstadoGral)
                .IsRequired(true);

            builder
                .Property(p => p.EstanqueCañerias)
                .IsRequired(true);

            builder
                .Property(p => p.EstrTransicion)
                .IsRequired(true);

            builder
                .Property(p => p.Fecha)
                .IsRequired(true);

            builder
                .Property(p => p.GrasaAntiox)
                .IsRequired(true);

            builder
                .Property(p => p.Grietas)
                .IsRequired(true);

            builder
                .Property(p => p.IluminacionBanquina)
                .IsRequired(true);

            builder
                .Property(p => p.LucesBaliza)
                .IsRequired(true);

            builder
                .Property(p => p.Mastil)
                .IsRequired(true);

            builder
                .Property(p => p.ObjetosExtraños)
                .IsRequired(true);

            builder
                .Property(p => p.Observaciones)
                .IsRequired(true);

            builder
                .Property(p => p.ObstruccionesCaños)
                .IsRequired(true);

            builder
                .Property(p => p.PedestalConcreto)
                .IsRequired(true);

            builder
                .Property(p => p.PernosFijaEstructura)
                .IsRequired(true);

            builder
                .Property(p => p.PernosFijaGabinetes)
                .IsRequired(true);

            builder
                .Property(p => p.PernosFijaPedestales)
                .IsRequired(true);

            builder
                .Property(p => p.PernosFijaPerfil)
                .IsRequired(true);

            builder
                .Property(p => p.PernosViga)
                .IsRequired(true);

            builder
                .Property(p => p.PilarMedicion)
                .IsRequired(true);

            builder
                .Property(p => p.PinturaBaliza)
                .IsRequired(true);

            builder
                .Property(p => p.PinturaBanquina)
                .IsRequired(true);

            builder
                .Property(p => p.PlataformasInspeccion)
                .IsRequired(true);

            builder
                .Property(p => p.PortoAcceso)
                .IsRequired(true);

            builder
                .Property(p => p.ProteccionTermo)
                .IsRequired(true);

            builder
                .Property(p => p.PuertaBanquina)
                .IsRequired(true);

            builder
                .Property(p => p.PuntaCaptora)
                .IsRequired(true);

            builder
                .Property(p => p.PuntosHumedad)
                .IsRequired(true);

            builder
                .Property(p => p.Razon)
                .IsRequired(true);

            builder
                .Property(p => p.RoturaPedestales)
                .IsRequired(true);

            builder
                .Property(p => p.SalvaCaidas)
                .IsRequired(true);

            builder
                .Property(p => p.SimboloRiesgoElec)
                .IsRequired(true);

            builder
                .Property(p => p.SoporteBalizas)
                .IsRequired(true);

            builder
                .Property(p => p.SoportesBandejas)
                .IsRequired(true);

            builder
                .Property(p => p.SoportesCañerias)
                .IsRequired(true);

            builder
                .Property(p => p.SoportesFijaciones)
                .IsRequired(true);

            builder
                .Property(p => p.TableroBaliza)
                .IsRequired(true);

            builder
                .Property(p => p.TableroEmergencia)
                .IsRequired(true);

            builder
                .Property(p => p.TableroGralCA)
                .IsRequired(true);

            builder
                .Property(p => p.TableroPrincipal)
                .IsRequired(true);

            builder
                .Property(p => p.UCLA)
                .IsRequired(true);

            builder
                .Property(p => p.UnionesTramos)
                .IsRequired(true);

            builder
                .Property(p => p.Verticalidad)
                .IsRequired(true);

            builder
                .Property(p => p.VigaEquipos)
                .IsRequired(true);

            builder
                .Property(p => p.Visibilidad)
                .IsRequired(true);
        }
    }
}
