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

        // Devuelve la cuenta ACTIVA del usuario (estado="A")
        public async Task<long> GetCuentaIdActualAsync(long id_usuario)
        {
            var idCuenta = await (
                from cu in _context.Set<ef_cuenta_usuarios>().AsNoTracking()
                join c in _context.Set<ef_cuentas>().AsNoTracking()
                    on cu.id_cuenta equals c.id_cuenta
                where cu.id_usuario == id_usuario
                      && cu.activo == true
                      && c.estado == "A"
                select (long?)c.id_cuenta
            ).FirstOrDefaultAsync();

            if (!idCuenta.HasValue)
                throw new InvalidOperationException("El usuario no tiene una cuenta ACTIVA asociada.");

            return idCuenta.Value;
        }

        public async Task<bool> EsAdminCuentaAsync(long id_usuario, long id_cuenta)
        {
            return await (
                from cu in _context.Set<ef_cuenta_usuarios>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on cu.id_rol equals r.id_rol
                where cu.id_usuario == id_usuario
                      && cu.id_cuenta == id_cuenta
                      && cu.activo == true
                      && r.codigo == "ACCOUNT_ADMIN"
                select cu
            ).AnyAsync();
        }

        public async Task<bool> CuentaActivaAsync(long id_cuenta)
        {
            return await _context.Set<ef_cuentas>()
                .AsNoTracking()
                .AnyAsync(x => x.id_cuenta == id_cuenta && x.estado == "A");
        }

        // Validación para módulo Unidades
        public async Task<bool> UnidadPerteneceACuentaAsync(long id_cuenta, long id_unidad)
        {
            return await _context.Set<ef_cuenta_unidades>()
                .AsNoTracking()
                .AnyAsync(u => u.id_unidad == id_unidad
                            && u.id_cuenta == id_cuenta
                            && u.activo == true);
        }

        // Validación para módulo Clientes
        public async Task<bool> ClientePerteneceACuentaAsync(long id_cuenta, long id_cliente)
        {
            return await _context.Set<ef_clientes>()
                .AsNoTracking()
                .AnyAsync(c => c.id_cliente == id_cliente
                            && c.id_cuenta == id_cuenta
                            && c.activo == true);
        }
    }
}
