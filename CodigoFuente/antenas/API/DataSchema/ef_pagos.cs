using System;

namespace API.DataSchema
{
    public class ef_pagos
    {
        public long id_pago { get; set; }

        public long? id_suscripcion { get; set; }
        public long? id_cuenta { get; set; }
        public long? id_evento { get; set; }

        public string tipo { get; set; } = null!;   // UNICO/RECURRENTE/...
        public string estado { get; set; } = null!; // CREADO/APROBADO/...

        public string moneda { get; set; } = null!;
        public decimal importe { get; set; }
        public decimal impuestos { get; set; }
        public decimal total { get; set; }

        public string? concepto { get; set; }
        public long? precio_referencia_id { get; set; }
        public string? snapshot_json { get; set; }

        public string? idempotency_key { get; set; }
        public string? external_provider { get; set; }
        public string? external_payment_id { get; set; }
        public string? external_status { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}
