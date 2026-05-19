using System;

namespace API.DataSchema.DTO.Regalos
{

    // FONDO / METAS (regalo grupal monetizable)


    public class RegalosFondoUpsertDTO
    {
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion_publica { get; set; }

        public string moneda_base { get; set; } = "ARS";
        public string modo_confirmacion { get; set; } = "INVITADO_Y_ORGANIZADOR"; // INVITADO_Y_ORGANIZADOR | SOLO_ORGANIZADOR

        public bool permitir_excedente { get; set; } = true;
        public bool mostrar_pendientes { get; set; } = true;
        public bool mostrar_muro_mensajes { get; set; } = true;
        public bool permitir_anonimo { get; set; } = true;
    }

    public class RegalosFondoDTO
    {
        public long id_fondo { get; set; }
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion_publica { get; set; }

        public string moneda_base { get; set; } = null!;
        public string modo_confirmacion { get; set; } = null!;

        public bool permitir_excedente { get; set; }
        public bool mostrar_pendientes { get; set; }
        public bool mostrar_muro_mensajes { get; set; }
        public bool permitir_anonimo { get; set; }

        public bool activo { get; set; }
    }

    public class RegalosFondoCrearMetaDTO
    {
        public long id_evento { get; set; }
        public long id_fondo { get; set; }

        public string tipo_meta { get; set; } = "GENERICA"; // GENERICA | EXPERIENCIA | PRODUCTO
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public decimal objetivo_monto { get; set; }

        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }

        public short orden { get; set; } = 1;
        public bool visible { get; set; } = true;
    }

    public class RegalosFondoMetaDTO
    {
        public long id_meta { get; set; }
        public long id_evento { get; set; }
        public long id_fondo { get; set; }

        public string tipo_meta { get; set; } = null!;
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public decimal objetivo_monto { get; set; }

        // calculados (en moneda_base del fondo)
        public decimal total_confirmado { get; set; }
        public decimal total_pendiente { get; set; }
        public decimal porcentaje { get; set; } // 0..1

        public short orden { get; set; }
        public bool visible { get; set; }
        public bool activo { get; set; }
    }

    public class RegalosFondoCrearAporteDTO
    {
        public long id_evento { get; set; }
        public long id_fondo { get; set; }
        public long id_meta { get; set; }

        public long? id_invitado { get; set; }
        public string? rsvp_token { get; set; }

        public string? nombre_mostrado { get; set; }
        public bool es_anonimo { get; set; } = false;

        public decimal? monto_aporte { get; set; }
        public string? moneda_aporte { get; set; }

        public string? mensaje { get; set; }
        public bool mostrar_en_muro { get; set; } = true;
    }

    public class RegalosFondoAporteDTO
    {
        public long id_aporte { get; set; }
        public long id_evento { get; set; }
        public long id_fondo { get; set; }
        public long id_meta { get; set; }

        public string estado { get; set; } = null!; // DECLARADO | PENDIENTE_CONFIRMACION | CONFIRMADO | RECHAZADO | ANULADO

        public decimal? monto_aporte { get; set; }
        public string? moneda_aporte { get; set; }

        // lo que suma a la barra (moneda_base) -> normalmente se carga al confirmar
        public decimal? monto_base_calculado { get; set; }
        public decimal? tipo_cambio_usado { get; set; }

        public string? mensaje { get; set; }
        public bool es_anonimo { get; set; }
        public bool mostrar_en_muro { get; set; }

        public DateTimeOffset fecha_declara { get; set; }
        public DateTimeOffset? fecha_confirma { get; set; }
        public long? id_usuario_confirma { get; set; }
    }

    public class RegalosFondoConfirmarAporteDTO
    {
        public decimal monto_base_calculado { get; set; }
        public decimal? tipo_cambio_usado { get; set; }
    }
}