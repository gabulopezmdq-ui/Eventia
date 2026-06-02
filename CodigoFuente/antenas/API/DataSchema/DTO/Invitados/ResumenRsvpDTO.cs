using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Invitados
{
    public class ResumenRsvpDTO
    {
        public long IdEvento { get; set; }
        public string? Evento { get; set; }
        public long IdRsvpGrupo { get; set; }
        public string Titular { get; set; }
        public string RsvpEstadoGrupo { get; set; }
        public string? RsvpMensaje { get; set; }

        //campos nuevos para poder volver a cargar o confirmar invitados
        public bool PuedeEditarGrupo { get; set; }

        public bool GrupoCerrado { get; set; }

        public int CuposInvitados { get; set; }
        public int PersonasCargadas { get; set; }
        public int CuposSinDefinir { get; set; }

        public int AdultosInvitados { get; set; }
        public int MenoresInvitados { get; set; }

        public int AdultosCargados { get; set; }
        public int MenoresCargados { get; set; }

        public int AdultosDisponibles { get; set; }
        public int MenoresDisponibles { get; set; }
        public List<ResumenRsvpIntegranteDTO> Integrantes { get; set; } = new();
    }

    public class ResumenRsvpIntegranteDTO
    {
        public long IdInvitado { get; set; }
        public string NombreCompleto { get; set; }
        public bool EsTitularGrupo { get; set; }
        public string RsvpEstado { get; set; }
        public string? QrToken { get; set; }
        public string? RsvpMensaje { get; set; }
        public DateTimeOffset? FechaRsvp { get; set; }

        public string? RolEvento { get; set; }

        public long? IdMesa { get; set; }
        public string? MesaNombre { get; set; }

        public bool TieneRestricciones { get; set; }
        public List<string> Restricciones { get; set; } = new();

        public int CantidadSugerenciasMusica { get; set; }
        public List<string> SugerenciasMusica { get; set; } = new();
    }
}