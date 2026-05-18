using System;

namespace API.DataSchema.DTO.Regalos
{
    // LISTA DE REGALOS (cumple infantil default)

    public class RegalosListaCrearItemDTO
    {
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public int cantidad_total { get; set; } = 1;
        public bool permitir_excedente { get; set; } = false;

        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }

        public short orden { get; set; } = 1;
        public bool visible { get; set; } = true;
    }

    public class RegalosListaItemDTO
    {
        public long id_regalo_item { get; set; }
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public int cantidad_total { get; set; }

        // calculados
        public int cantidad_reservada { get; set; }
        public int cantidad_disponible { get; set; }

        public short orden { get; set; }
        public bool visible { get; set; }
        public bool activo { get; set; }
    }

    public class RegalosListaReservarDTO
    {
        public long id_evento { get; set; }
        public long id_regalo_item { get; set; }

        public long? id_invitado { get; set; }
        public string? rsvp_token { get; set; }

        public string? nombre_mostrado { get; set; }
        public bool es_anonimo { get; set; } = false;

        public int cantidad { get; set; } = 1;
        public string? mensaje { get; set; }
    }

    public class RegalosListaReservaDTO
    {
        public long id_reserva { get; set; }
        public long id_evento { get; set; }
        public long id_regalo_item { get; set; }

        public int cantidad { get; set; }
        public string estado { get; set; } = null!; // RESERVA_ACTIVA | CANCELADA | VENCIDA (pero no usamos vencimiento automático)

        public string? mensaje { get; set; }
        public DateTimeOffset fecha_reserva { get; set; }
    }
}