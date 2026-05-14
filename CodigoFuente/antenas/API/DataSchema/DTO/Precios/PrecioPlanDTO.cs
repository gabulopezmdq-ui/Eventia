using System;

namespace API.DataSchema.DTO.Precios
{
    public class PrecioPlanDTO
    {
        public long id_plan { get; set; }
        public string codigo_plan { get; set; } = null!;
        public string nombre_plan { get; set; } = null!;
        public string codigo_mercado { get; set; } = null!;
        public string codigo_moneda { get; set; } = null!;
        public decimal precio_lista { get; set; }
        public decimal? precio_lanzamiento { get; set; }
        public decimal precio_publicado { get; set; }
        public bool tiene_lanzamiento { get; set; }
    }
}