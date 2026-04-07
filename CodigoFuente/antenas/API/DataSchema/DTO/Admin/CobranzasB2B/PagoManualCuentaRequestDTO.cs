using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    /// <summary>
    /// Pago manual para B2B (cuenta). Para POST /admin/cobranzas_cuentas/registrar
    /// </summary>
    public class PagoManualCuentaRequestDTO : PagoManualBaseDTO
    {
        [JsonProperty("id_cuenta")]
        public long IdCuenta { get; set; }

        [JsonProperty("id_suscripcion")]
        public long IdSuscripcion { get; set; }
    }
}
