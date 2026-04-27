using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    // =========================
    // PLANTILLA (CABECERA)
    // =========================

    public class CuentaHospedajePlantillaDTO
    {
        [JsonPropertyName("id_hospedaje_plantilla")]
        public long id_hospedaje_plantilla { get; set; }

        [JsonPropertyName("id_cuenta")]
        public long id_cuenta { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? id_unidad { get; set; }

        [JsonPropertyName("codigo")]
        public string? codigo { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }

        [JsonPropertyName("ciudad")]
        public string? ciudad { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("id_pais")]
        public short? id_pais { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }

    public class CuentaHospedajePlantillaUpsertRequestDTO
    {
        [JsonPropertyName("id_hospedaje_plantilla")]
        public long? id_hospedaje_plantilla { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? id_unidad { get; set; }

        [JsonPropertyName("codigo")]
        public string? codigo { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }

        [JsonPropertyName("ciudad")]
        public string? ciudad { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("id_pais")]
        public short? id_pais { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;
    }

    // =========================
    // ITEM
    // =========================

    public class CuentaHospedajePlantillaItemDTO
    {
        [JsonPropertyName("id_hospedaje_plantilla_item")]
        public long id_hospedaje_plantilla_item { get; set; }

        [JsonPropertyName("id_hospedaje_plantilla")]
        public long id_hospedaje_plantilla { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public string? tipo { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("direccion")]
        public string? direccion { get; set; }

        [JsonPropertyName("url_externa")]
        public string? url_externa { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("whatsapp")]
        public string? whatsapp { get; set; }

        [JsonPropertyName("latitud")]
        public decimal? latitud { get; set; }

        [JsonPropertyName("longitud")]
        public decimal? longitud { get; set; }

        [JsonPropertyName("etiquetas")]
        public string[] etiquetas { get; set; } = Array.Empty<string>();

        [JsonPropertyName("nota_publica")]
        public string? nota_publica { get; set; }

        [JsonPropertyName("recomendado")]
        public bool recomendado { get; set; }

        [JsonPropertyName("orden")]
        public short orden { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("bloque")]
        public CuentaHospedajePlantillaItemBloqueDTO? bloque { get; set; }
    }

    public class CuentaHospedajePlantillaItemUpsertRequestDTO
    {
        [JsonPropertyName("id_hospedaje_plantilla_item")]
        public long? id_hospedaje_plantilla_item { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public string? tipo { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("direccion")]
        public string? direccion { get; set; }

        [JsonPropertyName("url_externa")]
        public string? url_externa { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("whatsapp")]
        public string? whatsapp { get; set; }

        [JsonPropertyName("latitud")]
        public decimal? latitud { get; set; }

        [JsonPropertyName("longitud")]
        public decimal? longitud { get; set; }

        [JsonPropertyName("etiquetas")]
        public string[] etiquetas { get; set; } = Array.Empty<string>();

        [JsonPropertyName("nota_publica")]
        public string? nota_publica { get; set; }

        [JsonPropertyName("recomendado")]
        public bool recomendado { get; set; } = false;

        [JsonPropertyName("orden")]
        public short orden { get; set; } = 1;

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;

        [JsonPropertyName("bloque")]
        public CuentaHospedajePlantillaItemBloqueDTO? bloque { get; set; }
    }

    public class CuentaHospedajePlantillaItemBloqueDTO
    {
        [JsonPropertyName("nombre_reserva")]
        public string? nombre_reserva { get; set; }

        [JsonPropertyName("codigo_promocional")]
        public string? codigo_promocional { get; set; }

        [JsonPropertyName("fecha_limite_reserva")]
        public DateTime? fecha_limite_reserva { get; set; }

        [JsonPropertyName("condiciones")]
        public string? condiciones { get; set; }

        [JsonPropertyName("url_bloque")]
        public string? url_bloque { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;
    }

    // =========================
    // APLICAR A EVENTO
    // =========================

    public class CuentaHospedajePlantillaAplicarRequestDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("modo")]
        public string modo { get; set; } = "REEMPLAZAR"; // REEMPLAZAR | AGREGAR

        [JsonPropertyName("evitar_duplicados")]
        public bool evitar_duplicados { get; set; } = true;
    }
}