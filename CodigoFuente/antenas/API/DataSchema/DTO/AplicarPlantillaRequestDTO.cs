using System;

namespace API.DataSchema.DTO
{
    public class AplicarPlantillaRequestDTO
    {
        public short id_plantilla { get; set; }
        public bool borrar_existente { get; set; } = true;
        
        // base para completar fecha_hora_inicio (NOT NULL)
        public DateTimeOffset fecha_base { get; set; }

        // (opcionales): defaults para los tramos
        public string lugar_base { get; set; }
        public string direccion_base { get; set; }
        public decimal? latitud_base { get; set; }
        public decimal? longitud_base { get; set; }
    }
}
