using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_pagos : IRegistroUnico
    {
        public long id_inscripcion_pago { get; set; }

        public long id_inscripcion { get; set; }

        public DateTimeOffset fecha_pago { get; set; }

        public decimal importe { get; set; }

        public string moneda { get; set; } = null!;

        public string medio_pago { get; set; } = null!;

        public string? referencia { get; set; }

        public string? observaciones { get; set; }

        public bool anulado { get; set; }

        public DateTimeOffset? fecha_anulacion { get; set; }

        public string? motivo_anulacion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_programa_inscripciones? inscripcion { get; set; }
    }
}