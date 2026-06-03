using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class EventoNovedadesService : IEventoNovedadesService
    {
        private readonly DataContext _context;

        public EventoNovedadesService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<EventoNovedadDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivas)
        {
            var query =
                from n in _context.ef_evento_novedades
                join t in _context.ef_param_tipos_novedad_evento
                    on n.id_tipo_novedad_evento equals t.id_tipo_novedad_evento
                where n.id_evento == idEvento
                select new
                {
                    n,
                    t
                };

            if (soloActivas)
                query = query.Where(x => x.n.activo == true);

            var data = await query
                .OrderByDescending(x => x.n.importante)
                .ThenByDescending(x => x.n.fecha_alta)
                .ToListAsync();

            var idsTipos = data
                .Select(x => x.t.id_tipo_novedad_evento)
                .Distinct()
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "TIPO_NOVEDAD_EVENTO" &&
                    x.id_idioma == idIdioma &&
                    idsTipos.Contains(x.id_item))
                .ToListAsync();

            return data.Select(x =>
            {
                var trad = traducciones.FirstOrDefault(tr =>
                    tr.id_item == x.t.id_tipo_novedad_evento);

                return new EventoNovedadDTO
                {
                    id_novedad = x.n.id_novedad,
                    id_evento = x.n.id_evento,
                    id_tipo_novedad_evento = x.n.id_tipo_novedad_evento,
                    tipo_codigo = x.t.codigo,
                    tipo_texto = trad != null ? trad.texto : x.t.codigo,
                    titulo = x.n.titulo,
                    descripcion = x.n.descripcion,
                    importante = x.n.importante,
                    visible_desde = x.n.visible_desde,
                    visible_hasta = x.n.visible_hasta,
                    publicado = x.n.publicado,
                    activo = x.n.activo,
                    fecha_alta = x.n.fecha_alta
                };
            }).ToList();
        }

        public async Task<EventoNovedadDTO> GetByIdAsync(long idEvento, long idNovedad, int idIdioma)
        {
            var item = await GetByEventoAsync(idEvento, idIdioma, false);
            var novedad = item.FirstOrDefault(x => x.id_novedad == idNovedad);

            if (novedad == null)
                throw new Exception("No se encontró la novedad.");

            return novedad;
        }

        public async Task<EventoNovedadDTO> CrearAsync(long idEvento, EventoNovedadRequestDTO dto, long idUsuario)
        {
            Validar(dto);

            var existeEvento = await _context.ef_eventos.AnyAsync(x => x.id_evento == idEvento);
            if (!existeEvento)
                throw new Exception("No existe el evento.");

            var existeTipo = await _context.ef_param_tipos_novedad_evento
                .AnyAsync(x => x.id_tipo_novedad_evento == dto.id_tipo_novedad_evento && x.activo);

            if (!existeTipo)
                throw new Exception("El tipo de novedad no existe o no está activo.");

            var entity = new ef_evento_novedades
            {
                id_evento = idEvento,
                id_tipo_novedad_evento = dto.id_tipo_novedad_evento,
                titulo = dto.titulo.Trim(),
                descripcion = dto.descripcion.Trim(),
                importante = dto.importante,
                visible_desde = dto.visible_desde,
                visible_hasta = dto.visible_hasta,
                publicado = dto.publicado,
                activo = dto.activo,
                id_usuario_alta = idUsuario,
                fecha_alta = DateTime.UtcNow
            };

            _context.ef_evento_novedades.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(idEvento, entity.id_novedad, 1);
        }

        public async Task<EventoNovedadDTO> ModificarAsync(long idEvento, long idNovedad, EventoNovedadRequestDTO dto)
        {
            Validar(dto);

            var entity = await _context.ef_evento_novedades
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_novedad == idNovedad);

            if (entity == null)
                throw new Exception("No se encontró la novedad.");

            var existeTipo = await _context.ef_param_tipos_novedad_evento
                .AnyAsync(x => x.id_tipo_novedad_evento == dto.id_tipo_novedad_evento && x.activo);

            if (!existeTipo)
                throw new Exception("El tipo de novedad no existe o no está activo.");

            entity.id_tipo_novedad_evento = dto.id_tipo_novedad_evento;
            entity.titulo = dto.titulo.Trim();
            entity.descripcion = dto.descripcion.Trim();
            entity.importante = dto.importante;
            entity.visible_desde = dto.visible_desde;
            entity.visible_hasta = dto.visible_hasta;
            entity.publicado = dto.publicado;
            entity.activo = dto.activo;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(idEvento, idNovedad, 1);
        }

        public async Task<bool> EliminarAsync(long idEvento, long idNovedad)
        {
            var entity = await _context.ef_evento_novedades
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_novedad == idNovedad);

            if (entity == null)
                throw new Exception("No se encontró la novedad.");

            entity.activo = false;
            entity.fecha_modif = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private void Validar(EventoNovedadRequestDTO dto)
        {
            if (dto == null)
                throw new Exception("Debe informar los datos de la novedad.");

            if (string.IsNullOrWhiteSpace(dto.titulo))
                throw new Exception("Debe informar el título.");

            if (dto.titulo.Trim().Length > 150)
                throw new Exception("El título no puede superar los 150 caracteres.");

            if (string.IsNullOrWhiteSpace(dto.descripcion))
                throw new Exception("Debe informar la descripción.");

            if (dto.id_tipo_novedad_evento <= 0)
                throw new Exception("Debe informar el tipo de novedad.");

            if (dto.visible_desde.HasValue && dto.visible_hasta.HasValue &&
                dto.visible_hasta.Value < dto.visible_desde.Value)
                throw new Exception("La fecha visible hasta no puede ser menor que visible desde.");
        }

        public async Task<List<EventoNovedadDTO>> GetPublicByTokenAsync(string token, int idIdioma)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("Debe informar el token.");

            var ahora = DateTime.UtcNow;

            var idEvento = await _context.ef_invitados
                .Where(x => x.rsvp_token == token)
                .Select(x => x.id_evento)
                .FirstOrDefaultAsync();

            if (idEvento <= 0)
                throw new Exception("Token inválido.");

            var query =
                from n in _context.ef_evento_novedades
                join t in _context.ef_param_tipos_novedad_evento
                    on n.id_tipo_novedad_evento equals t.id_tipo_novedad_evento
                where n.id_evento == idEvento
                   && n.activo == true
                   && n.publicado == true
                   && (n.visible_desde == null || n.visible_desde <= ahora)
                   && (n.visible_hasta == null || n.visible_hasta >= ahora)
                select new
                {
                    n,
                    t
                };

            var data = await query
                .OrderByDescending(x => x.n.importante)
                .ThenByDescending(x => x.n.fecha_alta)
                .ToListAsync();

            var idsTipos = data
                .Select(x => x.t.id_tipo_novedad_evento)
                .Distinct()
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "TIPO_NOVEDAD_EVENTO" &&
                    x.id_idioma == idIdioma &&
                    idsTipos.Contains(x.id_item))
                .ToListAsync();

            return data.Select(x =>
            {
                var trad = traducciones.FirstOrDefault(tr =>
                    tr.id_item == x.t.id_tipo_novedad_evento);

                return new EventoNovedadDTO
                {
                    id_novedad = x.n.id_novedad,
                    id_evento = x.n.id_evento,
                    id_tipo_novedad_evento = x.n.id_tipo_novedad_evento,
                    tipo_codigo = x.t.codigo,
                    tipo_texto = trad != null ? trad.texto : x.t.codigo,
                    titulo = x.n.titulo,
                    descripcion = x.n.descripcion,
                    importante = x.n.importante,
                    visible_desde = x.n.visible_desde,
                    visible_hasta = x.n.visible_hasta,
                    publicado = x.n.publicado,
                    activo = x.n.activo,
                    fecha_alta = x.n.fecha_alta
                };
            }).ToList();
        }



    }
}
