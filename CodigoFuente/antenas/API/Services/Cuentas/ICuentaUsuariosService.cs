using API.DataSchema.DTO.Cuentas;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface ICuentaUsuariosService
    {
        Task<CuentaUsuarioInvitarResponseDTO> InvitarAsync(long id_usuario_invita, long id_cuenta, CuentaUsuarioInvitarRequestDTO request);

        Task<CuentaUsuarioValidarInvitacionResponseDTO> ValidarInvitacionAsync(string token);

        Task<CuentaUsuarioAceptarInvitacionResponseDTO> AceptarInvitacionAsync(long id_usuario_acepta, string token);

        Task<CuentaUsuarioOperacionResponseDTO> CambiarRolAsync(long id_usuario_admin, long id_cuenta, CuentaUsuarioCambiarRolRequestDTO request);

        Task<CuentaUsuarioOperacionResponseDTO> SetActivoAsync(long id_usuario_admin, long id_cuenta, long id_cuenta_usuario, bool activo);
        Task<List<CuentaUsuarioInvitacionPendienteDTO>> MisInvitacionesPendientesAsync(long id_usuario, long id_cuenta);
    }
}