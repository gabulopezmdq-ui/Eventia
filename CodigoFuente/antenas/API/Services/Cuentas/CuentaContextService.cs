using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public class CuentaContextService : ICuentaContextService
    {
        private readonly DataContext _context;

        public CuentaContextService(DataContext context)
        {
            _context = context;
        }

        public async Task<long> GetCuentaIdActualAsync(long id_usuario)
        {
            var idCuenta = await _context.ef_cuenta_usuarios
                .AsNoTracking()
                .Where(x => x.id_usuario == id_usuario && x.activo)
                .Select(x => (long?)x.id_cuenta)
                .FirstOrDefaultAsync();

            if (!idCuenta.HasValue)
                throw new InvalidOperationException("El usuario no tiene una cuenta activa asociada.");

            return idCuenta.Value;
        }

        public async Task<bool> EsAdminCuentaAsync(long id_usuario, long id_cuenta)
        {
            return await _context.ef_cuenta_usuarios
                .AsNoTracking()
                .Include(x => x.rol)
                .AnyAsync(x =>
                    x.id_usuario == id_usuario &&
                    x.id_cuenta == id_cuenta &&
                    x.activo &&
                    x.rol.codigo == "ACCOUNT_ADMIN");
        }

        public async Task<bool> CuentaActivaAsync(long id_cuenta)
        {
            return await _context.ef_cuentas
                .AsNoTracking()
                .AnyAsync(x => x.id_cuenta == id_cuenta && x.estado == "A");
        }
    }
}
