using System.Collections.Generic;

namespace API.DataSchema.DTO.Invitados
{
    public class CompletarGrupoRsvpRequest
    {
        public List<CompletarGrupoRsvpIntegranteRequest> Integrantes { get; set; } = new();
    }

    public class CompletarGrupoRsvpIntegranteRequest
    {
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;

        // A = adulto, N = menor
        public string RolEvento { get; set; } = null!;

        // Y = asiste, N = no asiste
        public string Asiste { get; set; } = "Y";

        public string? Email { get; set; }
        public string? Celular { get; set; }

        public string? Mensaje { get; set; }

        public List<CompletarGrupoRsvpRestriccionRequest> Restricciones { get; set; } = new();
        public List<CompletarGrupoRsvpMusicaRequest> Musica { get; set; } = new();
    }

    public class CompletarGrupoRsvpRestriccionRequest
    {
        public long IdRestriccionAlim { get; set; }
        public string? Observaciones { get; set; }
    }

    public class CompletarGrupoRsvpMusicaRequest
    {
        public string? Titulo { get; set; }
        public string? Artista { get; set; }
    }
}