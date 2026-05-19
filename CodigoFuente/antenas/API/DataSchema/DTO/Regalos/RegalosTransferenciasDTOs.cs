using System;

namespace API.DataSchema.DTO.Regalos
{
    public class RegalosTransferenciaUpsertDTO
    {
        public long? id_evento_regalo_transferencia { get; set; }
        public long id_evento { get; set; }

        public string codigo_moneda { get; set; } = null!;
        public string? titulo { get; set; }

        public string datos_transferencia_texto { get; set; } = null!;
        public string? instrucciones { get; set; }

        public short orden { get; set; } = 1;
        public bool activo { get; set; } = true;
    }

    public class RegalosTransferenciaDTO
    {
        public long id_evento_regalo_transferencia { get; set; }
        public long id_evento { get; set; }

        public string codigo_moneda { get; set; } = null!;
        public string? titulo { get; set; }

        public string datos_transferencia_texto { get; set; } = null!;
        public string? instrucciones { get; set; }

        public short orden { get; set; }
        public bool activo { get; set; }
    }
}