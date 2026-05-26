using System;
using System.ComponentModel.DataAnnotations;

namespace API.DataSchema
{
    public class PortalPersona
    {
        [Key] public long IdPortalPersona { get; set; }
        [Required] public Guid TokenPortal { get; set; }   // token único de la persona
        [Required, MaxLength(120)] public string Nombre { get; set; }
        [Required, MaxLength(120)] public string Email { get; set; }
        [MaxLength(30)] public string Telefono { get; set; }
        public DateTime FechaAlta { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; } = true;
    }
}
