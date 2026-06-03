using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.DTO.Eventos.Agenda;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos.Agenda
{
    public class EventoAgendaService : IEventoAgendaService
    {
        private readonly DataContext _context;

        public EventoAgendaService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<EventoAgendaDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivas)
        {
            var query =
                from a in _context.ef_evento_agenda
                join t in _context.ef_param_tipos_agenda_evento
                    on a.id_tipo_agenda_evento equals t.id_tipo_agenda_evento
                where a.id_evento == idEvento
                select new { a, t };

            if (soloActivas)
                query = query.Where(x => x.a.activo == true);

            var data = await query
                .OrderBy(x => x.a.id_tipo_agenda_evento)
                .ThenBy(x => x.a.dia_semana)
                .ThenBy(x => x.a.fecha)
                .ThenBy(x => x.a.orden)
                .ThenBy(x => x.a.hora_inicio)
                .ToListAsync();

            return await MapearAgendaAsync(data, idIdioma);
        }

        public async Task<EventoAgendaDTO> GetByIdAsync(long idEvento, long idAgenda, int idIdioma)
        {
            var items = await GetByEventoAsync(idEvento, idIdioma, false);
            var item = items.FirstOrDefault(x => x.id_agenda == idAgenda);

            if (item == null)
                throw new Exception("No se encontró el item de agenda.");

            return item;
        }

        public async Task<EventoAgendaDTO> CrearAsync(long idEvento, EventoAgendaRequestDTO dto)
        {
            Validar(dto);

            var existeEvento = await _context.ef_eventos.AnyAsync(x => x.id_evento == idEvento);
            if (!existeEvento)
                throw new Exception("No existe el evento.");

            await ValidarTipoAsync(dto.id_tipo_agenda_evento);

            if (dto.id_tramo.HasValue)
                await ValidarTramoAsync(idEvento, dto.id_tramo.Value);

            var entity = new ef_evento_agenda
            {
                id_evento = idEvento,
                id_tramo = dto.id_tramo,
                id_tipo_agenda_evento = dto.id_tipo_agenda_evento,
                titulo = dto.titulo.Trim(),
                descripcion = string.IsNullOrWhiteSpace(dto.descripcion) ? null : dto.descripcion.Trim(),
                dia_semana = dto.dia_semana,
                fecha = dto.fecha,
                hora_inicio = dto.hora_inicio,
                hora_fin = dto.hora_fin,
                orden = dto.orden <= 0 ? (short)1 : dto.orden,
                visible_publico = dto.visible_publico,
                activo = dto.activo,
                fecha_alta = DateTime.UtcNow
            };

            _context.ef_evento_agenda.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(idEvento, entity.id_agenda, 1);
        }

        public async Task<EventoAgendaDTO> ModificarAsync(long idEvento, long idAgenda, EventoAgendaRequestDTO dto)
        {
            Validar(dto);

            var entity = await _context.ef_evento_agenda
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_agenda == idAgenda);

            if (entity == null)
                throw new Exception("No se encontró el item de agenda.");

            await ValidarTipoAsync(dto.id_tipo_agenda_evento);

            if (dto.id_tramo.HasValue)
                await ValidarTramoAsync(idEvento, dto.id_tramo.Value);

            entity.id_tramo = dto.id_tramo;
            entity.id_tipo_agenda_evento = dto.id_tipo_agenda_evento;
            entity.titulo = dto.titulo.Trim();
            entity.descripcion = string.IsNullOrWhiteSpace(dto.descripcion) ? null : dto.descripcion.Trim();
            entity.dia_semana = dto.dia_semana;
            entity.fecha = dto.fecha;
            entity.hora_inicio = dto.hora_inicio;
            entity.hora_fin = dto.hora_fin;
            entity.orden = dto.orden <= 0 ? (short)1 : dto.orden;
            entity.visible_publico = dto.visible_publico;
            entity.activo = dto.activo;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(idEvento, idAgenda, 1);
        }

        public async Task<bool> EliminarAsync(long idEvento, long idAgenda)
        {
            var entity = await _context.ef_evento_agenda
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_agenda == idAgenda);

            if (entity == null)
                throw new Exception("No se encontró el item de agenda.");

            entity.activo = false;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<EventoAgendaDTO>> GetPublicByTokenAsync(string token, int idIdioma)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Debe informar el token.");

            var idEvento = await _context.ef_invitados
                .Where(x => x.rsvp_token == token)
                .Select(x => x.id_evento)
                .FirstOrDefaultAsync();

            if (idEvento <= 0)
                throw new Exception("Token inválido.");

            var query =
                from a in _context.ef_evento_agenda
                join t in _context.ef_param_tipos_agenda_evento
                    on a.id_tipo_agenda_evento equals t.id_tipo_agenda_evento
                where a.id_evento == idEvento
                   && a.activo == true
                   && a.visible_publico == true
                select new { a, t };

            var data = await query
                .OrderBy(x => x.a.id_tipo_agenda_evento)
                .ThenBy(x => x.a.dia_semana)
                .ThenBy(x => x.a.fecha)
                .ThenBy(x => x.a.orden)
                .ThenBy(x => x.a.hora_inicio)
                .ToListAsync();

            return await MapearAgendaAsync(data, idIdioma);
        }

        private async Task<List<EventoAgendaDTO>> MapearAgendaAsync(dynamic data, int idIdioma)
        {
            var lista = ((IEnumerable<dynamic>)data).ToList();

            var idsTipos = lista
                .Select(x => (long)x.t.id_tipo_agenda_evento)
                .Distinct()
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "TIPO_AGENDA_EVENTO" &&
                    x.id_idioma == idIdioma &&
                    idsTipos.Contains((long)x.id_item))
                .ToListAsync();

            return lista.Select(x =>
            {
                var trad = traducciones.FirstOrDefault(tr =>
                    (long)tr.id_item == (long)x.t.id_tipo_agenda_evento);

                return new EventoAgendaDTO
                {
                    id_agenda = x.a.id_agenda,
                    id_evento = x.a.id_evento,
                    id_tramo = x.a.id_tramo,
                    id_tipo_agenda_evento = x.a.id_tipo_agenda_evento,
                    tipo_codigo = x.t.codigo,
                    tipo_texto = trad != null ? trad.texto : x.t.codigo,
                    titulo = x.a.titulo,
                    descripcion = x.a.descripcion,
                    dia_semana = x.a.dia_semana,
                    fecha = x.a.fecha,
                    hora_inicio = x.a.hora_inicio,
                    hora_fin = x.a.hora_fin,
                    orden = x.a.orden,
                    visible_publico = x.a.visible_publico,
                    activo = x.a.activo,
                    fecha_alta = x.a.fecha_alta
                };
            }).ToList();
        }

        private async Task ValidarTipoAsync(long idTipoAgendaEvento)
        {
            var existeTipo = await _context.ef_param_tipos_agenda_evento
                .AnyAsync(x => x.id_tipo_agenda_evento == idTipoAgendaEvento && x.activo);

            if (!existeTipo)
                throw new Exception("El tipo de agenda no existe o no está activo.");
        }

        private async Task ValidarTramoAsync(long idEvento, long idTramo)
        {
            var existeTramo = await _context.ef_evento_tramos
                .AnyAsync(x => x.id_evento == idEvento && x.id_tramo == idTramo && x.activo);

            if (!existeTramo)
                throw new Exception("El tramo informado no existe o no pertenece al evento.");
        }

        private void Validar(EventoAgendaRequestDTO dto)
        {
            if (dto == null)
                throw new Exception("Debe informar los datos de agenda.");

            if (dto.id_tipo_agenda_evento <= 0)
                throw new Exception("Debe informar el tipo de agenda.");

            if (string.IsNullOrWhiteSpace(dto.titulo))
                throw new Exception("Debe informar el título.");

            if (dto.titulo.Trim().Length > 150)
                throw new Exception("El título no puede superar los 150 caracteres.");

            if (dto.dia_semana.HasValue && (dto.dia_semana.Value < 1 || dto.dia_semana.Value > 7))
                throw new Exception("El día de semana debe estar entre 1 y 7.");

            if (dto.hora_inicio.HasValue && dto.hora_fin.HasValue &&
                dto.hora_fin.Value < dto.hora_inicio.Value)
                throw new Exception("La hora fin no puede ser menor que la hora inicio.");
        }

        public async Task<EventoAgendaImportarTramosResponseDTO> ImportarTramosAsync(long idEvento)
        {
            var existeEvento = await _context.ef_eventos
                .AnyAsync(x => x.id_evento == idEvento);

            if (!existeEvento)
                throw new Exception("No existe el evento.");

            var tipoCronograma = await _context.ef_param_tipos_agenda_evento
                .FirstOrDefaultAsync(x => x.codigo == "CRONOGRAMA_EVENTO" && x.activo == true);

            if (tipoCronograma == null)
                throw new Exception("No existe el tipo de agenda CRONOGRAMA_EVENTO.");

            var tramos = await _context.ef_evento_tramos
                .Where(x => x.id_evento == idEvento && x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            if (tramos.Count == 0)
            {
                return new EventoAgendaImportarTramosResponseDTO
                {
                    ok = true,
                    id_evento = idEvento,
                    tramos_encontrados = 0,
                    creados = 0,
                    omitidos = 0
                };
            }

            var idsTramos = tramos.Select(x => x.id_tramo).ToList();

            var agendaExistentePorTramo = await _context.ef_evento_agenda
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.id_tramo != null &&
                    idsTramos.Contains(x.id_tramo.Value))
                .Select(x => x.id_tramo.Value)
                .ToListAsync();

            int creados = 0;
            int omitidos = 0;

            foreach (var tramo in tramos)
            {
                if (agendaExistentePorTramo.Contains(tramo.id_tramo))
                {
                    omitidos++;
                    continue;
                }

                var item = new ef_evento_agenda
                {
                    id_evento = idEvento,
                    id_tramo = tramo.id_tramo,
                    id_tipo_agenda_evento = tipoCronograma.id_tipo_agenda_evento,
                    titulo = !string.IsNullOrWhiteSpace(tramo.nombre)
                        ? tramo.nombre.Trim()
                        : "Tramo del evento",
                    descripcion = !string.IsNullOrWhiteSpace(tramo.leyenda_visible)
                        ? tramo.leyenda_visible.Trim()
                        : null,
                    dia_semana = null,
                    fecha = null,
                    //hora_inicio = tramo.fecha_hora_inicio.HasValue
                    //    ? tramo.fecha_hora_inicio.Value.TimeOfDay
                    //    : null,
                    //hora_fin = tramo.fecha_hora_fin.HasValue
                    //    ? tramo.fecha_hora_fin.Value.TimeOfDay
                    //    : null,
                    hora_inicio = tramo.fecha_hora_inicio.TimeOfDay,

                    hora_fin = tramo.fecha_hora_fin.HasValue
                        ? tramo.fecha_hora_fin.Value.TimeOfDay
                        : null,
                    orden = tramo.orden > 0 ? tramo.orden : (short)1,
                    visible_publico = true,
                    activo = true,
                    fecha_alta = DateTime.UtcNow
                };

                _context.ef_evento_agenda.Add(item);
                creados++;
            }

            await _context.SaveChangesAsync();

            return new EventoAgendaImportarTramosResponseDTO
            {
                ok = true,
                id_evento = idEvento,
                tramos_encontrados = tramos.Count,
                creados = creados,
                omitidos = omitidos
            };
        }
    }
}