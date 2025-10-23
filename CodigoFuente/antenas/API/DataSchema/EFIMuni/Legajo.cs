using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
        [Table("legajo", Schema = "liqhab")]
        public class Legajo
        {
            [Key]
            [Column("nro_legajo")]
            public int NroLegajo { get; set; }

            [Column("nombre")]
            public string Nombre { get; set; }

            [Column("nro_doc")]
            public int NroDoc { get; set; }
        }
    }