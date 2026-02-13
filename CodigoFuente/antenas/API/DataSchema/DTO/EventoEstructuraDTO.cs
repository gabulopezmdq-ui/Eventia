using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class EventoEstructuraDTO
    {
        public long id_evento { get; set; }
        public long? id_acceso_default { get; set; }
        public List<TramoDTO> tramos { get; set; } = new List<TramoDTO>();
        public List<AccesoDTO> accesos { get; set; } = new List<AccesoDTO>();
        public List<RelacionAccesoTramoDTO> relaciones { get; set; } = new List<RelacionAccesoTramoDTO>();
    }

    public class TramoDTO
    {
        public long id_tramo { get; set; }
        public short? id_tramo_tipo { get; set; }
        public string nombre { get; set; }
        public string leyenda_visible { get; set; }
        public string notas_internas { get; set; }
        public DateTimeOffset fecha_hora_inicio { get; set; }
        public DateTimeOffset? fecha_hora_fin { get; set; }
        public string lugar { get; set; }
        public string direccion { get; set; }
        public decimal? latitud { get; set; }
        public decimal? longitud { get; set; }
        public short orden { get; set; }
        public int? cupo { get; set; }
        public bool activo { get; set; }
    }

    public class AccesoDTO
    {
        public long id_acceso { get; set; }
        public string nombre { get; set; }
        public string mensaje_rsvp { get; set; }
        public bool es_publico { get; set; }
        public int? cupo { get; set; }
        public decimal? precio { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }
    }

    public class RelacionAccesoTramoDTO
    {
        public long id_acceso { get; set; }
        public long id_tramo { get; set; }
    }
}
