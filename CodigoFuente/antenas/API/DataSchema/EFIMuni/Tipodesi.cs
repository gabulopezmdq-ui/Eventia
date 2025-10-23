using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    [Table("tipodesi", Schema = "person")]
    public class TipoDesi
    {
        [Key]
        [Column("tipo_desig")]
        public int TipoDesig { get; set; }

        [Column("descrip")]
        public string Descrip { get; set; }
    }
}