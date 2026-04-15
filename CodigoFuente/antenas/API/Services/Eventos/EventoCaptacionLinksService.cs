using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace API.Services
{
    public class EventoCaptacionLinksService : IEventoCaptacionLinksService
    {
        private readonly DataContext _context;

        public EventoCaptacionLinksService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<EventoCaptacionLinkDTO>> GetByEventoAsync(long idUsuario, long idEvento)
        {
            await ValidarUsuarioPerteneceEvento(idUsuario, idEvento);

            var links = await _context.Set<ef_evento_acceso_links>()
                .AsNoTracking()
                .Include(x => x.acceso)
                .Include(x => x.tipo_beneficio_registro)
                .Where(x => x.id_evento == idEvento)
                .OrderByDescending(x => x.fecha_alta)
                .ToListAsync();

            if (!links.Any())
                return new List<EventoCaptacionLinkDTO>();

            var idsLinks = links.Select(x => x.id_acceso_link).ToList();

            var registradosPorLink = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .Where(x => x.id_acceso_link.HasValue && idsLinks.Contains(x.id_acceso_link.Value))
                .GroupBy(x => x.id_acceso_link!.Value)
                .Select(g => new { id_acceso_link = g.Key, cantidad = g.Count() })
                .ToDictionaryAsync(x => x.id_acceso_link, x => x.cantidad);

            var beneficiosOtorgados = await _context.Set<ef_evento_beneficios_registro>()
                .AsNoTracking()
                .Where(x => idsLinks.Contains(x.id_acceso_link))
                .GroupBy(x => x.id_acceso_link)
                .Select(g => new { id_acceso_link = g.Key, cantidad = g.Count() })
                .ToDictionaryAsync(x => x.id_acceso_link, x => x.cantidad);

            var beneficiosCanjeados = await _context.Set<ef_evento_beneficios_registro>()
                .AsNoTracking()
                .Where(x => idsLinks.Contains(x.id_acceso_link) && x.estado == "C")
                .GroupBy(x => x.id_acceso_link)
                .Select(g => new { id_acceso_link = g.Key, cantidad = g.Count() })
                .ToDictionaryAsync(x => x.id_acceso_link, x => x.cantidad);

            return links.Select(x => Map(
                x,
                registradosPorLink.ContainsKey(x.id_acceso_link) ? registradosPorLink[x.id_acceso_link] : 0,
                beneficiosOtorgados.ContainsKey(x.id_acceso_link) ? beneficiosOtorgados[x.id_acceso_link] : 0,
                beneficiosCanjeados.ContainsKey(x.id_acceso_link) ? beneficiosCanjeados[x.id_acceso_link] : 0
            )).ToList();
        }

        public async Task<EventoCaptacionLinkDTO> GetByIdAsync(long idUsuario, long idAccesoLink)
        {
            var link = await _context.Set<ef_evento_acceso_links>()
                .Include(x => x.acceso)
                .Include(x => x.tipo_beneficio_registro)
                .SingleOrDefaultAsync(x => x.id_acceso_link == idAccesoLink);

            if (link == null)
                throw new Exception("Link inexistente.");

            await ValidarUsuarioPerteneceEvento(idUsuario, link.id_evento);

            int registrados = await _context.Set<ef_invitados>()
                .CountAsync(x => x.id_acceso_link == idAccesoLink);

            int otorgados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_acceso_link == idAccesoLink);

            int canjeados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_acceso_link == idAccesoLink && x.estado == "C");

            return Map(link, registrados, otorgados, canjeados);
        }

        public async Task<EventoCaptacionLinkDTO> UpsertAsync(long idUsuario, long idEvento, EventoCaptacionLinkUpsertRequest req)
        {
            await ValidarUsuarioPerteneceEvento(idUsuario, idEvento);

            var acceso = await _context.Set<ef_evento_accesos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_acceso == req.id_acceso && x.id_evento == idEvento && x.activo);

            if (acceso == null)
                throw new Exception("El acceso no existe, no pertenece al evento o está inactivo.");

            if (string.IsNullOrWhiteSpace(req.titulo))
                throw new Exception("El título es obligatorio.");

            if (req.max_personas_total < 1)
                throw new Exception("max_personas_total debe ser mayor o igual a 1.");

            if (req.max_adultos < 0)
                throw new Exception("max_adultos no puede ser negativo.");

            if (req.cupo_beneficio.HasValue && req.cupo_beneficio.Value < 1)
                throw new Exception("cupo_beneficio debe ser mayor o igual a 1.");

            if (req.cupo_beneficio.HasValue && req.cupo_beneficio.Value > req.max_personas_total)
                throw new Exception("cupo_beneficio no puede ser mayor que max_personas_total.");

            if (req.es_captacion_publica && !req.requiere_registro)
                throw new Exception("Un link de captación pública debe requerir registro.");

            if (req.id_tipo_beneficio_registro.HasValue)
            {
                bool existeTipo = await _context.Set<ef_param_tipos_beneficio_registro>()
                    .AnyAsync(x => x.id_tipo_beneficio_registro == req.id_tipo_beneficio_registro.Value && x.activo);

                if (!existeTipo)
                    throw new Exception("El tipo de beneficio no existe o está inactivo.");

                if (string.IsNullOrWhiteSpace(req.beneficio_titulo))
                    throw new Exception("Si hay tipo de beneficio, beneficio_titulo es obligatorio.");
            }

            ef_evento_acceso_links entity;

            if (req.id_acceso_link.HasValue && req.id_acceso_link.Value > 0)
            {
                entity = await _context.Set<ef_evento_acceso_links>()
                    .SingleOrDefaultAsync(x => x.id_acceso_link == req.id_acceso_link.Value && x.id_evento == idEvento);

                if (entity == null)
                    throw new Exception("No se encontró el link a editar.");

                entity.fecha_modif = DateTimeOffset.UtcNow;
            }
            else
            {
                entity = new ef_evento_acceso_links
                {
                    token = GenerarTokenSeguro(32),
                    fecha_alta = DateTimeOffset.UtcNow,
                    id_usuario_creador = idUsuario,
                    id_evento = idEvento
                };

                _context.Set<ef_evento_acceso_links>().Add(entity);
            }

            entity.id_acceso = req.id_acceso;
            entity.titulo = req.titulo.Trim();
            entity.leyenda_publica = string.IsNullOrWhiteSpace(req.leyenda_publica) ? null : req.leyenda_publica.Trim();
            entity.max_personas_total = req.max_personas_total;
            entity.max_adultos = req.max_adultos;
            entity.fecha_expiracion = req.fecha_expiracion;
            entity.requiere_nombres_acompanantes = req.requiere_nombres_acompanantes;

            entity.es_captacion_publica = req.es_captacion_publica;
            entity.requiere_registro = req.requiere_registro;
            entity.cupo_beneficio = req.cupo_beneficio;
            entity.id_tipo_beneficio_registro = req.id_tipo_beneficio_registro;
            entity.beneficio_titulo = string.IsNullOrWhiteSpace(req.beneficio_titulo) ? null : req.beneficio_titulo.Trim();
            entity.beneficio_descripcion = string.IsNullOrWhiteSpace(req.beneficio_descripcion) ? null : req.beneficio_descripcion.Trim();
            entity.beneficio_hasta = req.beneficio_hasta;
            entity.mostrar_disponibles = req.mostrar_disponibles;
            entity.mensaje_post_registro = string.IsNullOrWhiteSpace(req.mensaje_post_registro) ? null : req.mensaje_post_registro.Trim();
            entity.origen_default = string.IsNullOrWhiteSpace(req.origen_default) ? null : req.origen_default.Trim();
            entity.permite_reutilizar_audiencia = req.permite_reutilizar_audiencia;
            entity.activo = req.activo;

            await _context.SaveChangesAsync();

            var result = await _context.Set<ef_evento_acceso_links>()
                .AsNoTracking()
                .Include(x => x.acceso)
                .Include(x => x.tipo_beneficio_registro)
                .SingleAsync(x => x.id_acceso_link == entity.id_acceso_link);

            int registrados = await _context.Set<ef_invitados>()
                .CountAsync(x => x.id_acceso_link == result.id_acceso_link);

            int otorgados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_acceso_link == result.id_acceso_link);

            int canjeados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_acceso_link == result.id_acceso_link && x.estado == "C");

            return Map(result, registrados, otorgados, canjeados);
        }

        public async Task<object> SetActivoAsync(long idUsuario, long idAccesoLink, bool activo)
        {
            var link = await _context.Set<ef_evento_acceso_links>()
                .SingleOrDefaultAsync(x => x.id_acceso_link == idAccesoLink);

            if (link == null)
                throw new Exception("Link inexistente.");

            await ValidarUsuarioPerteneceEvento(idUsuario, link.id_evento);

            link.activo = activo;
            link.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new
            {
                ok = true,
                id_acceso_link = idAccesoLink,
                activo = activo
            };
        }

        private async Task ValidarUsuarioPerteneceEvento(long idUsuario, long idEvento)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo);

            if (!pertenece)
                throw new UnauthorizedAccessException("El usuario no pertenece al evento.");
        }

        private EventoCaptacionLinkDTO Map(
            ef_evento_acceso_links x,
            int registrados,
            int beneficiosOtorgados,
            int beneficiosCanjeados)
        {
            return new EventoCaptacionLinkDTO
            {
                id_acceso_link = x.id_acceso_link,
                id_evento = x.id_evento,
                id_acceso = x.id_acceso,
                acceso_nombre = x.acceso != null ? x.acceso.nombre : string.Empty,
                titulo = x.titulo,
                leyenda_publica = x.leyenda_publica,
                token = x.token,
                es_captacion_publica = x.es_captacion_publica,
                requiere_registro = x.requiere_registro,
                max_personas_total = x.max_personas_total,
                max_adultos = x.max_adultos,
                cupo_beneficio = x.cupo_beneficio,
                id_tipo_beneficio_registro = x.id_tipo_beneficio_registro,
                tipo_beneficio_codigo = x.tipo_beneficio_registro != null ? x.tipo_beneficio_registro.codigo : null,
                beneficio_titulo = x.beneficio_titulo,
                beneficio_descripcion = x.beneficio_descripcion,
                mostrar_disponibles = x.mostrar_disponibles,
                mensaje_post_registro = x.mensaje_post_registro,
                origen_default = x.origen_default,
                permite_reutilizar_audiencia = x.permite_reutilizar_audiencia,
                fecha_expiracion = x.fecha_expiracion,
                beneficio_hasta = x.beneficio_hasta,
                activo = x.activo,
                registrados = registrados,
                beneficios_otorgados = beneficiosOtorgados,
                beneficios_canjeados = beneficiosCanjeados
            };
        }

        private static string GenerarTokenSeguro(int bytesLength)
        {
            var bytes = new byte[bytesLength];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }

            var token = Convert.ToBase64String(bytes)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "");

            return token.Length > 43 ? token.Substring(0, 43) : token;
        }
    }
}