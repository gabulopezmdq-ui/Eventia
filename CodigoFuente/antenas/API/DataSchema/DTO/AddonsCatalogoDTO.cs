using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    // Catálogo público de Add-ons (para cards)
    public class AddonPublicoDTO
    {
        public long id_addon { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }
        public string scope { get; set; } = null!; // EVENTO | CUENTA

        public AddonPublicoPrecioDTO? precio { get; set; }

        public List<AddonPublicoFeatureDTO> features { get; set; } = new List<AddonPublicoFeatureDTO>();
    }

    public class AddonPublicoPrecioDTO
    {
        public string mercado { get; set; } = null!;
        public string moneda { get; set; } = null!;
        public decimal importe { get; set; }
        public bool impuestos_incluidos { get; set; }
        public DateTimeOffset vigente_desde { get; set; }
    }

    public class AddonPublicoFeatureDTO
    {
        public long id_feature { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string categoria { get; set; } = null!;
        public bool monetizable { get; set; }
    }
}