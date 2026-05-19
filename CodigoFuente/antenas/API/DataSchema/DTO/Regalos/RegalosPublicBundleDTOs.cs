using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Regalos
{
    // ──────────────────────────────────────
    // BUNDLE PÚBLICO: /public/eventos/{token}/regalos
    // ──────────────────────────────────────

    public class RegalosPublicBundleDTO
    {
        public long id_evento { get; set; }

        //contexto del invitado que está viendo el portal
        public long id_invitado { get; set; }
        public string rsvp_token { get; set; } = null!;

        public bool mostrar_transferencias { get; set; }
        public bool mostrar_lista { get; set; }
        public bool mostrar_fondo { get; set; }

        public List<RegalosPublicTransferenciaDTO> transferencias { get; set; } = new();

        public RegalosPublicListaDTO? lista { get; set; }
        public RegalosPublicFondoDTO? fondo { get; set; }
    }

    // ──────────────────────────────────────
    // Transferencias (texto libre)
    // ──────────────────────────────────────
    public class RegalosPublicTransferenciaDTO
    {
        public string codigo_moneda { get; set; } = null!;
        public string? titulo { get; set; }
        public string datos_transferencia_texto { get; set; } = null!;
        public string? instrucciones { get; set; }
        public short orden { get; set; }
    }

    // ──────────────────────────────────────
    // Lista de regalos (público)
    // ──────────────────────────────────────
    public class RegalosPublicListaDTO
    {
        public List<RegalosPublicListaItemDTO> items { get; set; } = new();
    }

    public class RegalosPublicListaItemDTO
    {
        public long id_regalo_item { get; set; }
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public int cantidad_total { get; set; }
        public int cantidad_reservada { get; set; }
        public int cantidad_disponible { get; set; }

        public short orden { get; set; }
    }

    // ──────────────────────────────────────
    // Fondo / metas (público)
    // ──────────────────────────────────────
    public class RegalosPublicFondoDTO
    {
        public RegalosPublicFondoConfigDTO config { get; set; } = new();
        public List<RegalosPublicFondoMetaDTO> metas { get; set; } = new();
    }

    public class RegalosPublicFondoConfigDTO
    {
        public long id_fondo { get; set; }
        public string titulo { get; set; } = null!;
        public string? descripcion_publica { get; set; }

        public string moneda_base { get; set; } = null!;
        public string modo_confirmacion { get; set; } = null!; // INVITADO_Y_ORGANIZADOR | SOLO_ORGANIZADOR

        public bool mostrar_pendientes { get; set; }
        public bool permitir_anonimo { get; set; }
    }

    public class RegalosPublicFondoMetaDTO
    {
        public long id_meta { get; set; }
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public decimal objetivo_monto { get; set; }

        public decimal total_confirmado { get; set; }
        public decimal total_pendiente { get; set; }
        public decimal porcentaje { get; set; } // 0..1

        public short orden { get; set; }
    }
}