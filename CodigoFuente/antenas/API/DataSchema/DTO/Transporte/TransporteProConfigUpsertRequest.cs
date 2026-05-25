namespace API.DataSchema.DTO.Transporte
{
    public class TransporteProConfigUpsertRequest
    {
        public bool pro_habilitado { get; set; } = false;
        public bool requiere_pago { get; set; } = false;

        public int max_plazas_por_reserva { get; set; } = 4;
        public bool permitir_reservar_ida { get; set; } = true;
        public bool permitir_reservar_vuelta { get; set; } = true;
        public int? vencimiento_minutos_pago { get; set; }

        public PagoTransferenciaRequest? pago { get; set; }

        public class PagoTransferenciaRequest
        {
            public string? pago_titular_cuenta { get; set; }
            public string? pago_cbu_alias { get; set; }
            public string? pago_banco { get; set; }
            public string? pago_instrucciones { get; set; }
        }
    }
}