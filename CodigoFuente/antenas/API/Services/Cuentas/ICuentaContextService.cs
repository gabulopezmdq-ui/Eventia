using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface ICuentaContextService
    {
        Task<long> GetCuentaIdActualAsync(long id_usuario);
        Task<bool> EsAdminCuentaAsync(long id_usuario, long id_cuenta);
        Task<bool> CuentaActivaAsync(long id_cuenta);
    }
}
