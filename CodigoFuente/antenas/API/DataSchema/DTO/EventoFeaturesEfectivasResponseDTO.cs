using API.DataSchema.DTO;
using System.Collections.Generic;

public class EventoFeaturesEfectivasResponseDTO
{
    public long id_evento { get; set; }

    public string scope_comercial { get; set; } = "EVENTO"; // EVENTO | CUENTA

    public long? id_cuenta { get; set; }

    public long? id_plan { get; set; }
    public string? plan_codigo { get; set; }
    public string? plan_nombre { get; set; }

    public TrialDTO? trial { get; set; }

    public List<AddonActivoDTO> addons_evento { get; set; } = new List<AddonActivoDTO>();
    public List<AddonActivoDTO> addons_cuenta { get; set; } = new List<AddonActivoDTO>();

    public List<FeatureEfectivaDTO> features { get; set; } = new List<FeatureEfectivaDTO>();
}