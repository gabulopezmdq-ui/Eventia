using API.DataSchema;
using API.DataSchema.DTO;
using API.Utility;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class AlbumService : IAlbumService
    {
        private readonly DataContext _context;
        private readonly IStorageService _storage;
        private readonly IFeatureGuardService _guard;

        public AlbumService(DataContext context, IStorageService storage, IFeatureGuardService guard)
        {
            _context = context;
            _storage = storage;
            _guard = guard;
        }

        public async Task<ef_evento_album_fotos> UploadFotoAsync(long id_evento, long? id_invitado, string? device_id, AlbumUploadDTO dto)
        {
            // 1. Validar límites y features
            if (!await _guard.CanUploadFotoAsync(id_evento, device_id))
            {
                throw new Exception("Límite de subida alcanzado o feature no disponible para este plan.");
            }

            // 2. Guardar archivo
            string folder = $"{id_evento}/album/{DateTime.UtcNow:yyyy}/{DateTime.UtcNow:MM}";
            var storageResult = await _storage.SaveFileAsync(dto.archivo.OpenReadStream(), dto.archivo.FileName, folder);

            if (!storageResult.Success)
            {
                throw new Exception($"Error al guardar el archivo: {storageResult.Error}");
            }

            // 3. Crear registro en BD
            var config = await GetConfigAsync(id_evento);
            
            var foto = new ef_evento_album_fotos
            {
                id_evento = id_evento,
                id_invitado = id_invitado,
                id_tramo = dto.id_tramo,
                device_id = device_id,
                storage_provider = "LOCAL",
                storage_key = storageResult.Key!,
                url_publica = storageResult.Url,
                nombre_original = dto.archivo.FileName,
                mime_type = dto.archivo.ContentType,
                tamano_bytes = dto.archivo.Length,
                nombre_invitado = dto.nombre_invitado,
                mensaje = dto.mensaje,
                origen = dto.origen,
                estado = config.moderacion_obligatoria ? "PENDIENTE" : "APROBADA",
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_album_fotos.Add(foto);
            await _context.SaveChangesAsync();

            return foto;
        }

        public async Task<PagedResult<ef_evento_album_fotos>> GetFeedAsync(long id_evento, AlbumFeedFilterDTO filter)
        {
            var query = _context.ef_evento_album_fotos
                .Where(f => f.id_evento == id_evento && f.activo);

            if (!string.IsNullOrEmpty(filter.estado))
            {
                query = query.Where(f => f.estado == filter.estado);
            }

            if (filter.id_tramo.HasValue)
            {
                query = query.Where(f => f.id_tramo == filter.id_tramo);
            }

            if (filter.es_destacada.HasValue)
            {
                query = query.Where(f => f.es_destacada == filter.es_destacada);
            }

            int total = await query.CountAsync();
            var items = await query
                .OrderByDescending(f => f.fecha_alta)
                .Skip((filter.page - 1) * filter.pageSize)
                .Take(filter.pageSize)
                .ToListAsync();

            return new PagedResult<ef_evento_album_fotos>
            {
                Items = items,
                TotalCount = total,
                Page = filter.page,
                PageSize = filter.pageSize
            };
        }

        public async Task ModerarFotoAsync(AlbumModeracionDTO dto, long id_usuario_admin)
        {
            var foto = await _context.ef_evento_album_fotos.FindAsync(dto.id_foto);
            if (foto == null) throw new Exception("Foto no encontrada");

            foto.estado = dto.estado;
            if (dto.es_destacada.HasValue)
            {
                foto.es_destacada = dto.es_destacada.Value;
            }

            // Registrar historial
            _context.ef_evento_album_estados_hist.Add(new ef_evento_album_estados_hist
            {
                id_foto = foto.id_foto,
                estado = dto.estado,
                id_usuario = id_usuario_admin,
                fecha_alta = DateTimeOffset.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task RegistrarLikeAsync(AlbumLikeDTO dto)
        {
            // Validar si ya existe el like
            bool existe = await _context.ef_evento_album_likes
                .AnyAsync(l => l.id_foto == dto.id_foto && l.device_id == dto.device_id);

            if (existe) return;

            var foto = await _context.ef_evento_album_fotos.FindAsync(dto.id_foto);
            if (foto == null) throw new Exception("Foto no encontrada");

            var like = new ef_evento_album_likes
            {
                id_foto = dto.id_foto,
                id_evento = foto.id_evento,
                device_id = dto.device_id,
                id_invitado = dto.id_invitado,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_album_likes.Add(like);
            foto.likes_count++;

            await _context.SaveChangesAsync();
        }

        public async Task<ef_evento_album_config> GetConfigAsync(long id_evento)
        {
            var config = await _context.ef_evento_album_config.FindAsync(id_evento);
            if (config == null)
            {
                // Crear config por defecto si no existe
                config = new ef_evento_album_config { id_evento = id_evento };
                _context.ef_evento_album_config.Add(config);
                await _context.SaveChangesAsync();
            }
            return config;
        }

        public async Task UpdateConfigAsync(long id_evento, AlbumConfigUpdateDTO dto)
        {
            var config = await GetConfigAsync(id_evento);
            
            config.moderacion_obligatoria = dto.moderacion_obligatoria;
            config.permitir_nombre_invitado = dto.permitir_nombre_invitado;
            config.permitir_mensaje = dto.permitir_mensaje;
            config.permitir_likes = dto.permitir_likes;
            config.permitir_descarga = dto.permitir_descarga;
            config.live_modo = dto.live_modo;
            config.fotocabina_activa = dto.fotocabina_activa;
            config.fotocabina_overlay_default_id = dto.fotocabina_overlay_default_id;

            await _context.SaveChangesAsync();
        }
    }
}
