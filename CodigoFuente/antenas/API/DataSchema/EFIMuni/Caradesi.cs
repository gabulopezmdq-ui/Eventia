using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    [Table("caradesi", Schema = "person")]
    public class Caradesi
    {
        [Key]
        [Column("caracter")]
        public int Caracter { get; set; }

        [Column("descrip")]
        public string Descrip { get; set; }

        [Column("descr_abrev")]
        public string? DescrAbrev { get; set; }

        [Column("cod_planta")]
        public string? CodPlanta { get; set; }
    }
}