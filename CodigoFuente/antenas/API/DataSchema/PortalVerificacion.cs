using System;
using System.ComponentModel.DataAnnotations;

namespace API.DataSchema
{
    public class PortalVerificacion
    {
        [Key] public long Id { get; set; }
        [Required, MaxLength(100)] public string TokenConsulta { get; set; }
        [MaxLength(120)] public string EmailUsado { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        public bool ResultadoOk { get; set; }
    }
}
