using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class PlanPublicoDTO
    {
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public string tipo { get; set; } = null!;     // B2C / B2B
        public string periodo { get; set; } = null!;  // UNICO / MENSUAL / ANUAL

        public PlanPublicoPrecioDTO? precio { get; set; }

        public List<PlanPublicoFeatureDTO> features { get; set; } = new List<PlanPublicoFeatureDTO>();
        public List<PlanPublicoLimiteDTO> limites { get; set; } = new List<PlanPublicoLimiteDTO>();
    }
}
