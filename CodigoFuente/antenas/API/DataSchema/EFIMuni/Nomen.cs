using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    [Table("nomen", Schema = "liqhab")]
    public class Nomen
    {
        [Key]
        [Column("cod_grupo")]
        public int CodGrupo { get; set; }

        [Column("cod_nivel")]
        public int? CodNivel { get; set; }

        [Column("cargo")]
        public int Cargo { get; set; }

        [Column("descrip")]
        public string Descripcion { get; set; }

        [Column("desccorta")]
        public string? Desccorta { get; set; }
    }
}