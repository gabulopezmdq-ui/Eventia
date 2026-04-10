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

    //public class RsvpConfirmacionDTO
    //{
    //    public string Nombre { get; set; }
    //    public string Apellido { get; set; }

    //    public string Email { get; set; }
    //    public string Celular { get; set; }

    //    public bool Asiste { get; set; }

    //    public string Mensaje { get; set; }

    //    public List<RsvpAcompanianteDTO> Acompanantes { get; set; }
    //    public List<IntegranteRestriccionesUpsertDTO>? Restricciones { get; set; }
    //}
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
        public string? Token { get; set; }
        public List<TramoAgendaDTO>? Tramos { get; set; }
        public string RsvpEstado { get; set; } // "P", "Y", "N"
        public long? IdRsvpGrupo { get; set; }
        public long? IdAcceso { get; set; }
    }
    public class CrearLinkGenericoDTO
    {
        public long IdAcceso { get; set; }
        public string Titulo { get; set; }
        public int? MaxPersonasTotal { get; set; }
        public int? MaxAdultos { get; set; }
        public bool RequiereNombresAcompanantes { get; set; } // nuevo
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
        public int CantAdultosSinNombre { get; set; }   // <-- nuevo
        public int CantMenoresSinNombre { get; set; }   // <-- nuevo
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
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string? Email { get; set; }
        public string? Celular { get; set; }
        public int? Edad { get; set; }
        public string? RolEvento { get; set; }
        public bool Asiste { get; set; }
        public string? Mensaje { get; set; }
        public string? AlimentacionDetalle { get; set; }
        public List<long>? IdsRestricciones { get; set; }
    }

    public class RsvpConfirmacionDTO
    {
        public string MensajeGrupo { get; set; }
        public List<RsvpPersonaConfirmacionDTO> Personas { get; set; }
    }

    public class InvitacionTitularDTO
    {
        public long IdGrupo { get; set; }
        public string NombreGrupo { get; set; }
        public string Saludo { get; set; }
        public string Anfitriones { get; set; }
        public string MensajeBienvenida { get; set; }
        public List<AccesoAgendaDTO> Agenda { get; set; }  // Ahora cada acceso tiene sus tramos
        public List<PersonaExistenteDTO> Personas { get; set; }
        public int CuposAdultosRestantes { get; set; }
        public int CuposMenoresRestantes { get; set; }
    }

    public class AccesoAgendaDTO
    {
        public long IdAcceso { get; set; }
        public string NombreAcceso { get; set; }      // Ej: "Iglesia"
        public List<TramoAgendaDTO> Tramos { get; set; }
    }
    public class TramoAgendaDTO
    {
        public long IdTramo { get; set; }
        public string Nombre { get; set; }             // Ej: "Ceremonia religiosa"
        public string Descripcion { get; set; }        // Ej: "llegar 15 minutos antes"
        public string Lugar { get; set; }               // Ej: "Estancia Santa Clara"
        public string Direccion { get; set; }           // Ej: "Ruta 2 Km 395"
    }
    public class PersonaExistenteDTO
    {
        public long IdInvitado { get; set; }
        public string NombreCompleto { get; set; }
        public string RolEvento { get; set; }   // "A" o "N"
        public string Asiste { get; set; }      // "P", "Y", "N"
        public bool EsTitular { get; set; }
    }

    public class RegistroLinkRequest
    {
        public string TokenLink { get; set; }
        public string NombreGrupo { get; set; }
        public PersonaRegistroDTO Titular { get; set; }
        public List<PersonaRegistroDTO> Acompanantes { get; set; } // opcional
    }

    public class PersonaRegistroDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public string Celular { get; set; }
        public string RolEvento { get; set; } // "A" o "N"
    }
}
