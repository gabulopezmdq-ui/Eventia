using API.DataSchema;
using API.DataSchema.DTO.Eventos.Checklist;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Services.Eventos.Historial;

namespace API.Services.Eventos.Checklist
{
    public class EventoChecklistService : IEventoChecklistService
    {
        private readonly DataContext _context;
        private readonly IEventoHistorialService _historial;

        public EventoChecklistService(DataContext context, IEventoHistorialService historial)
        {
            _context = context;
            _historial = historial;
        }

        public async Task<List<EventoChecklistDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivos, bool? completado)
        {
            var query =
                from c in _context.ef_evento_checklist
                join p in _context.ef_param_checklist_prioridades
                    on c.id_checklist_prioridad equals p.id_checklist_prioridad
                where c.id_evento == idEvento
                select new { c, p };

            if (soloActivos)
                query = query.Where(x => x.c.activo == true);

            if (completado.HasValue)
                query = query.Where(x => x.c.completado == completado.Value);

            var data = await query
                .OrderBy(x => x.c.completado)
                .ThenByDescending(x => x.p.orden)
                .ThenBy(x => x.c.orden)
                .ThenBy(x => x.c.fecha_limite)
                .ThenByDescending(x => x.c.fecha_alta)
                .ToListAsync();

            return await MapearAsync(data, idIdioma);
        }

        public async Task<EventoChecklistDTO> GetByIdAsync(long idEvento, long idChecklist, int idIdioma)
        {
            var items = await GetByEventoAsync(idEvento, idIdioma, false, null);
            var item = items.FirstOrDefault(x => x.id_checklist == idChecklist);

            if (item == null)
                throw new Exception("No se encontró la tarea.");

            return item;
        }

        public async Task<EventoChecklistDTO> CrearAsync(long idEvento, EventoChecklistRequestDTO dto, long idUsuario)
        {
            Validar(dto);

            var existeEvento = await _context.ef_eventos.AnyAsync(x => x.id_evento == idEvento);
            if (!existeEvento)
                throw new Exception("No existe el evento.");

            await ValidarPrioridadAsync(dto.id_checklist_prioridad);

            var entity = new ef_evento_checklist
            {
                id_evento = idEvento,
                id_checklist_prioridad = dto.id_checklist_prioridad,
                titulo = dto.titulo.Trim(),
                descripcion = string.IsNullOrWhiteSpace(dto.descripcion) ? null : dto.descripcion.Trim(),
                categoria = string.IsNullOrWhiteSpace(dto.categoria) ? null : dto.categoria.Trim(),
                fecha_limite = dto.fecha_limite,
                completado = dto.completado,
                fecha_completado = dto.completado ? DateTime.UtcNow : null,
                orden = dto.orden <= 0 ? (short)1 : dto.orden,
                activo = dto.activo,
                id_usuario_alta = idUsuario,
                id_usuario_completa = dto.completado ? idUsuario : null,
                fecha_alta = DateTime.UtcNow
            };

            _context.ef_evento_checklist.Add(entity);
            await _context.SaveChangesAsync();

            await _historial.RegistrarAsync(
                idEvento,
                "CHECKLIST",
                "CREAR",
                "ef_evento_checklist",
                entity.id_checklist,
                $"Se creó tarea '{entity.titulo}'",
                idUsuario
            );

            return await GetByIdAsync(idEvento, entity.id_checklist, 1);
        }

        public async Task<EventoChecklistDTO> ModificarAsync(long idEvento, long idChecklist, EventoChecklistRequestDTO dto, long idUsuario)
        {
            Validar(dto);

            var entity = await _context.ef_evento_checklist
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_checklist == idChecklist);

            if (entity == null)
                throw new Exception("No se encontró la tarea.");

            await ValidarPrioridadAsync(dto.id_checklist_prioridad);

            entity.id_checklist_prioridad = dto.id_checklist_prioridad;
            entity.titulo = dto.titulo.Trim();
            entity.descripcion = string.IsNullOrWhiteSpace(dto.descripcion) ? null : dto.descripcion.Trim();
            entity.categoria = string.IsNullOrWhiteSpace(dto.categoria) ? null : dto.categoria.Trim();
            entity.fecha_limite = dto.fecha_limite;
            entity.orden = dto.orden <= 0 ? (short)1 : dto.orden;
            entity.activo = dto.activo;
            entity.fecha_modif = DateTime.UtcNow;

            if (entity.completado != dto.completado)
            {
                entity.completado = dto.completado;
                entity.fecha_completado = dto.completado ? DateTime.UtcNow : null;
                entity.id_usuario_completa = dto.completado ? idUsuario : null;
            }

            await _context.SaveChangesAsync();

            await _historial.RegistrarAsync(
                idEvento,
                "CHECKLIST",
                "EDITAR",
                "ef_evento_checklist",
                entity.id_checklist,
                $"Se modificó tarea '{entity.titulo}'",
                idUsuario
            );

            return await GetByIdAsync(idEvento, idChecklist, 1);
        }

        public async Task<EventoChecklistDTO> SetCompletadoAsync(long idEvento, long idChecklist, bool completado, long idUsuario)
        {
            var entity = await _context.ef_evento_checklist
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_checklist == idChecklist);

            if (entity == null)
                throw new Exception("No se encontró la tarea.");

            entity.completado = completado;
            entity.fecha_completado = completado ? DateTime.UtcNow : null;
            entity.id_usuario_completa = completado ? idUsuario : null;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _historial.RegistrarAsync(
                idEvento,
                "CHECKLIST",
                completado ? "COMPLETAR" : "REABRIR",
                "ef_evento_checklist",
                entity.id_checklist,
                completado
                    ? $"Se completó tarea '{entity.titulo}'"
                    : $"Se reabrió tarea '{entity.titulo}'",
                idUsuario
            );

            return await GetByIdAsync(idEvento, idChecklist, 1);
        }

        public async Task<bool> EliminarAsync(long idEvento, long idChecklist)
        {
            var entity = await _context.ef_evento_checklist
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_checklist == idChecklist);

            if (entity == null)
                throw new Exception("No se encontró la tarea.");

            entity.activo = false;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _historial.RegistrarAsync(
                idEvento,
                "CHECKLIST",
                "ELIMINAR",
                "ef_evento_checklist",
                entity.id_checklist,
                $"Se eliminó tarea '{entity.titulo}'",
                null
            );

            return true;
        }

        private async Task<List<EventoChecklistDTO>> MapearAsync(dynamic data, int idIdioma)
        {
            var lista = ((IEnumerable<dynamic>)data).ToList();

            var ids = lista
                .Select(x => (long)x.p.id_checklist_prioridad)
                .Distinct()
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "CHECKLIST_PRIORIDAD" &&
                    x.id_idioma == idIdioma &&
                    ids.Contains((long)x.id_item))
                .ToListAsync();

            return lista.Select(x =>
            {
                var trad = traducciones.FirstOrDefault(tr =>
                    (long)tr.id_item == (long)x.p.id_checklist_prioridad);

                return new EventoChecklistDTO
                {
                    id_checklist = x.c.id_checklist,
                    id_evento = x.c.id_evento,
                    id_checklist_prioridad = x.c.id_checklist_prioridad,
                    prioridad_codigo = x.p.codigo,
                    prioridad_texto = trad != null ? trad.texto : x.p.codigo,
                    titulo = x.c.titulo,
                    descripcion = x.c.descripcion,
                    categoria = x.c.categoria,
                    fecha_limite = x.c.fecha_limite,
                    completado = x.c.completado,
                    fecha_completado = x.c.fecha_completado,
                    orden = x.c.orden,
                    activo = x.c.activo,
                    id_usuario_alta = x.c.id_usuario_alta,
                    id_usuario_completa = x.c.id_usuario_completa,
                    fecha_alta = x.c.fecha_alta
                };
            }).ToList();
        }

        private async Task ValidarPrioridadAsync(long idPrioridad)
        {
            var existe = await _context.ef_param_checklist_prioridades
                .AnyAsync(x => x.id_checklist_prioridad == idPrioridad && x.activo);

            if (!existe)
                throw new Exception("La prioridad no existe o no está activa.");
        }

        private void Validar(EventoChecklistRequestDTO dto)
        {
            if (dto == null)
                throw new Exception("Debe informar los datos de la tarea.");

            if (dto.id_checklist_prioridad <= 0)
                throw new Exception("Debe informar la prioridad.");

            if (string.IsNullOrWhiteSpace(dto.titulo))
                throw new Exception("Debe informar el título.");

            if (dto.titulo.Trim().Length > 150)
                throw new Exception("El título no puede superar los 150 caracteres.");

            if (!string.IsNullOrWhiteSpace(dto.categoria) && dto.categoria.Trim().Length > 80)
                throw new Exception("La categoría no puede superar los 80 caracteres.");
        }
    }
}