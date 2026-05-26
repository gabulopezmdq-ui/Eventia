using System;

namespace API.DataSchema.DTO.Regalos
{
    public class RegalosFondoAporteListItemDTO
    {
        public long id_aporte { get; set; }
        public long id_evento { get; set; }
        public long id_fondo { get; set; }
        public long id_meta { get; set; }

        public string meta_titulo { get; set; } = null!;

        public string estado { get; set; } = null!; // DECLARADO | PENDIENTE_CONFIRMACION | CONFIRMADO | (otros si existieran)

        public decimal? monto_aporte { get; set; }
        public string? moneda_aporte { get; set; }

        public decimal? monto_base_calculado { get; set; }
        public decimal? tipo_cambio_usado { get; set; }

        public string? nombre_mostrado { get; set; }
        public bool es_anonimo { get; set; }

        public string? mensaje { get; set; }
        public bool mostrar_en_muro { get; set; }

        public DateTimeOffset fecha_declara { get; set; }
        public DateTimeOffset? fecha_confirma { get; set; }
        public long? id_usuario_confirma { get; set; }

        public bool activo { get; set; }
    }
}