using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface ICuentaContextService
    {
        // Devuelve la cuenta ACTIVA asociada al usuario (tenant actual)
        Task<long> GetCuentaIdActualAsync(long id_usuario);

        // Seguridad: el usuario es admin de esa cuenta
        Task<bool> EsAdminCuentaAsync(long id_usuario, long id_cuenta);

        // Cuenta está activa (A)
        Task<bool> CuentaActivaAsync(long id_cuenta);

        // Validaciones para módulos nuevos
        Task<bool> UnidadPerteneceACuentaAsync(long id_cuenta, long id_unidad);
        Task<bool> ClientePerteneceACuentaAsync(long id_cuenta, long id_cliente);
    }
}