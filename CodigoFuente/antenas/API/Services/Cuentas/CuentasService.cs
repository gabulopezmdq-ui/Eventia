using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.DTO.Cuentas;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public class CuentasService : ICuentasService
    {
        private readonly DataContext _context;
        private readonly ICuentaContextService _cuentaContextService;

        public CuentasService(DataContext context, ICuentaContextService cuentaContextService)
        {
            _context = context;
            _cuentaContextService = cuentaContextService;
        }

        public async Task<CuentaResponseDTO> GetMiCuentaAsync(long id_usuario)
        {
            var id_cuenta = await _cuentaContextService.GetCuentaIdActualAsync(id_usuario);

            var cuenta = await _context.ef_cuentas
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_cuenta == id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("No se encontró la cuenta.");

            return new CuentaResponseDTO
            {
                id_cuenta = cuenta.id_cuenta,
                nombre_cuenta = cuenta.nombre_cuenta,
                tipo = cuenta.tipo,
                estado = cuenta.estado,
                id_plan = cuenta.id_plan,
                fecha_alta = cuenta.fecha_alta,
                fecha_modif = cuenta.fecha_modif
            };
        }

        public async Task<CuentaResponseDTO> UpdateMiCuentaAsync(long id_usuario, CuentaUpdateRequestDTO request)
        {
            var id_cuenta = await _cuentaContextService.GetCuentaIdActualAsync(id_usuario);

            var esAdmin = await _cuentaContextService.EsAdminCuentaAsync(id_usuario, id_cuenta);
            if (!esAdmin)
                throw new UnauthorizedAccessException("Solo ACCOUNT_ADMIN puede editar la cuenta.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("No se encontró la cuenta.");

            if (string.IsNullOrWhiteSpace(request.nombre_cuenta))
                throw new InvalidOperationException("El nombre de la cuenta es obligatorio.");

            if (string.IsNullOrWhiteSpace(request.tipo))
                throw new InvalidOperationException("El tipo de cuenta es obligatorio.");

            var tipo = request.tipo.Trim().ToUpper();

            if (tipo != "SALON" && tipo != "PLANNER" && tipo != "EMPRESA")
                throw new InvalidOperationException("El tipo de cuenta es inválido.");

            cuenta.nombre_cuenta = request.nombre_cuenta.Trim();
            cuenta.tipo = tipo;
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new CuentaResponseDTO
            {
                id_cuenta = cuenta.id_cuenta,
                nombre_cuenta = cuenta.nombre_cuenta,
                tipo = cuenta.tipo,
                estado = cuenta.estado,
                id_plan = cuenta.id_plan,
                fecha_alta = cuenta.fecha_alta,
                fecha_modif = cuenta.fecha_modif
            };
        }
    }
}