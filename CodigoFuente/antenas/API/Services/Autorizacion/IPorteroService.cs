using API.DataSchema.DTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IPorteroService
    {
        Task<QrScanResponseRetiroDTO?> ScanQrAsync(
                                             string qrToken,
                                             string? deviceId,
                                             long? idUsuarioOperador,
                                             string? ip,
                                             string? userAgent);
        Task<RetiroConfirmResponseDTO> ConfirmarRetiroAsync(string qrToken, RetiroConfirmRequestDTO dto, long? idUsuarioOperador);
        Task<List<RetiroListItemDTO>> ListRetirosAsync(long idEvento, DateTimeOffset? desde, DateTimeOffset? hasta);
        Task<List<ScanListItemDTO>> ListScansAsync(long idEvento, DateTimeOffset? desde, DateTimeOffset? hasta, string? resultado);
        Task<List<PendienteRetiroDTO>> ListPendientesRetiroAsync(long idEvento);
        Task<PorteroResumenDTO> GetResumenAsync(long idEvento);
        Task<RetiroConfirmResponseDTO> ConfirmarRetiroAsyncQR(string qrToken, RetiroConfirmRequestDTO dto, long? idUsuarioOperador = null);
        Task<bool> RegistrarCheckinAsync(long idInvitado, long idAcceso, string? deviceId, long? idUsuarioOperador, string? ip, string? userAgent);


    }
}