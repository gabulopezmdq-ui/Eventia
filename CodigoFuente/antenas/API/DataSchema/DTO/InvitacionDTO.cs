using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{

    public class RsvpConfirmacionRequest
    {
        public string Token { get; set; } = null!;
        public RsvpConfirmacionDTO Datos { get; set; } = null!;
    }

    public class GenerarLinkRequest
    {
        public long IdEvento { get; set; }
    }
    public class CargaInvitadosRequest
    {
        public long IdEvento { get; set; }
        public List<InvitadoCreateDTO> Invitados { get; set; } = new();
    }

    public class InvitadoCreateDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string? Email { get; set; }
        public string? Celular { get; set; }
    }

    public class RsvpConfirmacionDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }

        public string Email { get; set; }
        public string Celular { get; set; }

        public bool Asiste { get; set; }

        public string Mensaje { get; set; }

        public List<RsvpAcompanianteDTO> Acompanantes { get; set; }
        public List<IntegranteRestriccionesUpsertDTO>? Restricciones { get; set; }
    }
    public class ConfirmarInvitacionDTO
    {
        public string Token { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }

        public string Email { get; set; }
        public string Celular { get; set; }

        public bool Asiste { get; set; }

        public string Mensaje { get; set; }

        public List<RsvpAcompanianteDTO> Acompanantes { get; set; }
    }
    public class RsvpNinoDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
    }
    public class RsvpAcompanianteDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }

        public short? EdadAnios { get; set; }

        public long? IdEventoEdadRango { get; set; }
    }
    public class InvitadoLinkDTO
    {
        public long IdInvitado { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public string Celular { get; set; }
        public string Token { get; set; }
    }
    public class CrearLinkGenericoDTO
    {
        public long IdAcceso { get; set; }

        public string Titulo { get; set; }

        public int? MaxPersonasTotal { get; set; }

        public int? MaxAdultos { get; set; }
    }

    public class InvitacionEventoDTO
    {
        public long IdEvento { get; set; }
        public long IdAcceso { get; set; }

        public string Anfitriones { get; set; }
        public string? MensajeBienvenida { get; set; }
        public string? DressCode { get; set; }

        public string NombreAcceso { get; set; }
    }

    public class CrearGrupoInvitacionRequest
    {
        public long IdEvento { get; set; }

        public long IdAcceso { get; set; }

        public string NombreGrupo { get; set; }

        public int MaxPersonasTotal { get; set; }

        public List<PersonaInvitacionDTO> Personas { get; set; }
    }

    public class PersonaInvitacionDTO
    {
        public string Nombre { get; set; }

        public string Apellido { get; set; }

        public string Email { get; set; }

        public string Celular { get; set; }

        public bool Titular { get; set; }

        public string RolEvento { get; set; } // A / N
    }

    public class RsvpPersonaConfirmacionDTO
    {
        public long? IdInvitado { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }

        public string Email { get; set; }
        public string Celular { get; set; }

        public bool Asiste { get; set; }

        public string RolEvento { get; set; }

        public string Mensaje { get; set; }

        public string MensajeGrupo { get; set; }
    }
}
