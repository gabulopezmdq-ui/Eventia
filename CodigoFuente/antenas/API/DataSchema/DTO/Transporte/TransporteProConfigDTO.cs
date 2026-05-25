using System;

namespace API.DataSchema.DTO.Transporte
{
    public class TransporteProConfigDTO
    {
        public long id_evento { get; set; }

        public bool pro_habilitado { get; set; }
        public bool requiere_pago { get; set; }

        public int max_plazas_por_reserva { get; set; }
        public bool permitir_reservar_ida { get; set; }
        public bool permitir_reservar_vuelta { get; set; }
        public int? vencimiento_minutos_pago { get; set; }

        public PagoTransferenciaDTO pago { get; set; } = new PagoTransferenciaDTO();

        public DateTimeOffset? fecha_modif { get; set; }

        public class PagoTransferenciaDTO
        {
            public string? pago_titular_cuenta { get; set; }
            public string? pago_cbu_alias { get; set; }
            public string? pago_banco { get; set; }
            public string? pago_instrucciones { get; set; }
        }
    }
}