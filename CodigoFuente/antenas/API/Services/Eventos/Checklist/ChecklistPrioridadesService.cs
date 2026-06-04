using API.DataSchema;
using API.DataSchema.DTO.Eventos.Checklist;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos.Checklist
{
    public class ChecklistPrioridadesService : IChecklistPrioridadesService
    {
        private readonly DataContext _context;

        public ChecklistPrioridadesService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<ChecklistPrioridadComboDTO>> ComboAsync(int idIdioma)
        {
            var prioridades = await _context.ef_param_checklist_prioridades
                .Where(x => x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var ids = prioridades
                .Select(x => x.id_checklist_prioridad)
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "CHECKLIST_PRIORIDAD" &&
                    x.id_idioma == idIdioma &&
                    ids.Contains((long)x.id_item))
                .ToListAsync();

            return prioridades.Select(p =>
            {
                var trad = traducciones.FirstOrDefault(x => (long)x.id_item == p.id_checklist_prioridad);

                return new ChecklistPrioridadComboDTO
                {
                    id_checklist_prioridad = p.id_checklist_prioridad,
                    codigo = p.codigo,
                    texto = trad != null ? trad.texto : p.codigo
                };
            }).ToList();
        }
    }
}