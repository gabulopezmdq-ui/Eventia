using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class CrearEstructuraManualRequestDTO
    {
        public bool borrar_existente { get; set; } = true;

        public DateTimeOffset fecha_base { get; set; }
        public string lugar_base { get; set; }
        public string direccion_base { get; set; }
        public decimal? latitud_base { get; set; }
        public decimal? longitud_base { get; set; }

        // para registrar “no encontré mi plantilla”
        public bool registrar_solicitud { get; set; } = true;
        public string motivo { get; set; } = "NO_HAY_PLANTILLAS";
        // valores permitidos:
        // "NO_HAY_PLANTILLAS"
        // "NINGUNA_SE_ADAPTA"

        public long? id_solicitud_draft { get; set; }  // opcional, pero en este flujo lo vas a mandar


        public List<TramoManualDTO> tramos { get; set; } = new();
        public List<AccesoManualDTO> accesos { get; set; } = new();
        public List<RelacionManualDTO> relaciones { get; set; } = new();
    }

    public class TramoManualDTO
    {
        public short? id_tramo_tipo { get; set; }
        public string nombre { get; set; }
        public string leyenda_visible { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; } = true;
    }

    public class AccesoManualDTO
    {
        public string nombre { get; set; }
        public string mensaje_rsvp { get; set; }
        public short orden { get; set; }
        public bool es_default { get; set; } = false;
        public bool activo { get; set; } = true;
    }

    // relaciones por ORDEN para que el front no necesite ids
    public class RelacionManualDTO
    {
        public short acceso_orden { get; set; }
        public short tramo_orden { get; set; }
    }
}