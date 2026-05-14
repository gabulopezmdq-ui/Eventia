using API.DataSchema;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public class PlanLimitesHelper
    {
        private readonly DataContext _context;

        public PlanLimitesHelper(DataContext context)
        {
            _context = context;
        }

        public async Task<string?> GetPlanCodigoByEventoAsync(long idEvento)
        {
            var idPlan = await _context.ef_eventos
                .Where(e => e.id_evento == idEvento)
                .Select(e => e.id_plan)
                .FirstOrDefaultAsync();

            if (idPlan == null) return null;

            return await _context.ef_planes
                .Where(p => p.id_plan == idPlan.Value)
                .Select(p => p.codigo)
                .FirstOrDefaultAsync();
        }

        public async Task<int?> GetLimiteIntByEventoAsync(long idEvento, string codigoLimite)
        {
            var idPlan = await _context.ef_eventos
                .Where(e => e.id_evento == idEvento)
                .Select(e => e.id_plan)
                .FirstOrDefaultAsync();

            if (idPlan == null) return null;

            return await _context.ef_plan_limites
                .Where(l => l.id_plan == idPlan.Value
                         && l.codigo_limite == codigoLimite
                         && l.activo == true)
                .Select(l => l.valor_int)
                .FirstOrDefaultAsync();
        }

        public async Task<int?> GetLimiteIntByPlanAsync(long idPlan, string codigoLimite)
        {
            return await _context.ef_plan_limites
                .Where(l => l.id_plan == idPlan
                         && l.codigo_limite == codigoLimite
                         && l.activo == true)
                .Select(l => l.valor_int)
                .FirstOrDefaultAsync();
        }

        public async Task RequireLimiteEnabledAsync(long idEvento, string codigoLimite, string mensajeError)
        {
            var v = await GetLimiteIntByEventoAsync(idEvento, codigoLimite);
            if (v.HasValue && v.Value == 0)
                throw new InvalidOperationException(mensajeError);
        }
    }
}