using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class EventoFeaturesEfectivasResponseDTO
    {
        public long id_evento { get; set; }

        public long? id_plan { get; set; }
        public string? plan_codigo { get; set; }
        public string? plan_nombre { get; set; }

        public TrialDTO trial { get; set; } = new TrialDTO();

        public List<AddonActivoDTO> addons_evento { get; set; } = new List<AddonActivoDTO>();
        public List<FeatureEfectivaDTO> features { get; set; } = new List<FeatureEfectivaDTO>();
    }
}