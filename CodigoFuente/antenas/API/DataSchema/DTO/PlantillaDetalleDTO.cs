using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class PlantillaDetalleDTO
    {
        public short id_plantilla { get; set; }
        public int id_tipo_evento { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!; // calculado a partir del codigo
        public bool activo { get; set; }

        public List<PlantillaTramoItemDTO> tramos { get; set; } = new();
        public List<PlantillaAccesoItemDTO> accesos { get; set; } = new();
        public List<PlantillaRelacionItemDTO> relaciones { get; set; } = new();

        // para cards rápidas
        public int tramos_count => tramos?.Count ?? 0;
        public int accesos_count => accesos?.Count ?? 0;
    }

    public class PlantillaTramoItemDTO
    {
        public long id_plantilla_tramo { get; set; }
        public short? id_tramo_tipo { get; set; }
        public string nombre_default { get; set; } = null!;
        public string? leyenda_default { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }
    }

    public class PlantillaAccesoItemDTO
    {
        public long id_plantilla_acceso { get; set; }
        public string nombre_default { get; set; } = null!;
        public string? mensaje_rsvp_default { get; set; }
        public bool es_publico_default { get; set; }
        public short orden { get; set; }
        public bool es_default { get; set; }
        public bool activo { get; set; }
    }

    public class PlantillaRelacionItemDTO
    {
        public long id_plantilla_acceso { get; set; }
        public long id_plantilla_tramo { get; set; }
    }
}
