using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    [Table("cargos", Schema = "liqhab")]
    public class Cargos
    {
        [Key]
        [Column("nro_legajo")]
        public int NroLegajo { get; set; }

        [Column("nro_orden")]
        public int? NroOrden { get; set; }

        [Column("uni_eje")]
        public int? UniEje { get; set; }

        [Column("uni_eje2")]
        public int? UniEje2 { get; set; }

        [Column("cod_grupo")]
        public int? CodGrupo { get; set; }

        [Column("cod_nivel")]
        public int? CodNivel { get; set; }

        [Column("modulo")]
        public int? Modulo { get; set; }

        [Column("cargo")]
        public int? Cargo { get; set; }

        [Column("final")]
        public int? Final { get; set; }

        [Column("situac")]
        public int? Situac { get; set; }

        [Column("fealta")]
        public DateTime? FechaAlta { get; set; }

        [Column("febaja")]
        public DateTime? FechaBaja { get; set; }

        [Column("nro_lis")]
        public int? NroLis { get; set; }

        [Column("funcion")]
        public int? Funcion { get; set; }

        [Column("programa")]
        public int? Programa { get; set; }

        [Column("actividad")]
        public int? Actividad { get; set; }

        [Column("cod_delega")]
        public int? CodDelega { get; set; }

        [Column("cod_relac")]
        public int? CodRelac { get; set; }

        [Column("cod_conce")]
        public int? CodConce { get; set; }

        [Column("cod_planta")]
        public string? CodPlanta { get; set; }

        [Column("cod_tipo")]
        public string? CodTipo { get; set; }

        [Column("cod_depend")]
        public string? CodDepend { get; set; }

        [Column("cod_caja")]
        public int? CodCaja { get; set; }

        [Column("cod_sindic")]
        public int? CodSindic { get; set; }

        [Column("cod_dedica")]
        public string? CodDedica { get; set; }

        [Column("cod_foracc")]
        public int? CodForacc { get; set; }

        [Column("decreto")]
        public string? Decreto { get; set; }

        [Column("caracter")]
        public int? Caracter { get; set; }

        [Column("tipo_desig")]
        public int? TipoDesig { get; set; }

        [Column("nro_docen")]
        public string? NroDocen { get; set; }

        [Column("carg_presu")]
        public int? CargPresu { get; set; }

        [Column("cod_activ")]
        public int? CodActiv { get; set; }

        [Column("tipo_presu")]
        public string? TipoPresu { get; set; }

        [Column("cod_fun")]
        public int? CodFun { get; set; }

        [Column("cod_fpago")]
        public string? CodFpago { get; set; }

        [Column("benefpre")]
        public string? BenefPre { get; set; }

        [Column("cajaot")]
        public string? CajaOt { get; set; }

        [Column("finiben")]
        public DateTime? Finiben { get; set; }

        [Column("regest")]
        public string? Regest { get; set; }

        [Column("impgcias")]
        public string? Impgcias { get; set; }

        [Column("politico")]
        public int? Politico { get; set; }

        [Column("fecha_noti")]
        public DateTime? FechaNoti { get; set; }

        [Column("dep_des")]
        public int? DepDes { get; set; }

        [Column("percibe_hs")]
        public int? PercibeHs { get; set; }

        [Column("motivo_hs")]
        public string? MotivoHs { get; set; }

        [Column("cargo_ips")]
        public int? CargoIps { get; set; }
    }
}