using System.Collections.Generic;

namespace API.DataSchema.DTO.Portal
{
    public class MiEventiaResponseDto
    {
        public PersonaDto Persona { get; set; }
        public List<AccesoItemDto> Items { get; set; }
    }

    public class PersonaDto
    {
        public long IdPortalPersona { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
    }

    public class AccesoItemDto
    {
        public string Tipo { get; set; }               // "PROGRAMA" o "EVENTO"
        public long IdEvento { get; set; }
        public long IdInscripcion { get; set; }
        public long? IdInvitado { get; set; }
        public string TokenConsulta { get; set; }       // string (token de 32 chars) para compatibilidad
        public string Titulo { get; set; }
        public string Estado { get; set; }
        public string UrlPortal { get; set; }
    }
}
