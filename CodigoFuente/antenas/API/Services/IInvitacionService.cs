using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema.DTO.Invitados;

namespace API.Services
{
    public interface IInvitacionService
    {
        //Task<string> GenerarLinkAsync(long idEvento, long idUsuario);
        //Task<object> ObtenerEventoAsync(string token);
        Task ConfirmarAsync(string token, RsvpConfirmacionDTO datos);
        Task<List<InvitadoLinkDTO>> ObtenerInvitadosParaEnvioAsync(long idEvento);
        Task<string> CrearLinkGenericoAsync(CrearLinkGenericoDTO dto);
        Task<InvitacionEventoDTO?> ObtenerDatosInvitacionAsync(string token);
        Task<string> GenerarLinkInvitacionAsync(long idUsuario, long idAcceso);
        Task CargarInvitadosAsync(CrearGrupoInvitacionRequest req, long idUsuario);
        Task<InvitacionTitularDTO> ObtenerInvitacionTitularAsync(string token);
        Task<string> RegistrarGrupoDesdeLinkAsync(string tokenLink, RegistroLinkRequest request);
        Task<InvitadosPersonasResponseDTO> ObtenerPersonasInvitadasAsync(long idEvento);
        Task<InvitadosGruposResponseDTO> ObtenerGruposInvitadosAsync(long idEvento);
        Task<ResumenRsvpDTO> ObtenerResumenRsvpAsync(string token);
    }
}