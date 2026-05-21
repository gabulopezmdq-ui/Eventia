using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Staff
{
    public class StaffRenovarRequest
    {
        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }
    }
}