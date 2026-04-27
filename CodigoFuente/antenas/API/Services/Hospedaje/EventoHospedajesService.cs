using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Services
{
    public class EventoHospedajesService : IEventoHospedajesService
    {
        private readonly DataContext _context;

        public EventoHospedajesService(DataContext context)
        {
            _context = context;
        }

        private async Task<bool> PerteneceEventoAsync(long id_usuario, long id_evento)
        {
            return await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == id_evento && x.id_usuario == id_usuario && x.activo == true);
        }

        // ===============================
        // CONFIG: ef_evento_features (HOSPEDAJES)
        // ===============================
        private async Task<ef_evento_features> GetOrCreateEventoFeatureHospedajes(long id_evento)
        {
            var id_feature = await _context.Set<ef_param_features>()
                .Where(f => f.codigo == "HOSPEDAJES" && f.activo == true)
                .Select(f => f.id_feature)
                .FirstOrDefaultAsync();

            if (id_feature == 0)
                throw new Exception("No existe feature HOSPEDAJES en ef_param_features.");

            var ef = await _context.Set<ef_evento_features>()
                .SingleOrDefaultAsync(x => x.id_evento == id_evento && x.id_feature == id_feature);

            if (ef == null)
            {
                ef = new ef_evento_features
                {
                    id_evento = id_evento,
                    id_feature = id_feature,
                    activo = true,
                    config_json = null,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_features>().Add(ef);
                await _context.SaveChangesAsync();
            }

            return ef;
        }

        private static HospedajesConfigDTO ParseConfig(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return new HospedajesConfigDTO();

            try
            {
                return JsonSerializer.Deserialize<HospedajesConfigDTO>(json) ?? new HospedajesConfigDTO();
            }
            catch
            {
                return new HospedajesConfigDTO();
            }
        }

        public async Task<bool> SetConfigAsync(long id_usuario, long id_evento, HospedajesConfigDTO config)
        {
            bool pertenece = await PerteneceEventoAsync(id_usuario, id_evento);
            if (!pertenece) throw new UnauthorizedAccessException();

            config.visibilidad = (config.visibilidad ?? "PUBLICO").Trim().ToUpperInvariant();
            if (config.visibilidad != "PUBLICO" && config.visibilidad != "SOLO_CONFIRMADOS")
                config.visibilidad = "PUBLICO";

            var ef = await GetOrCreateEventoFeatureHospedajes(id_evento);
            ef.config_json = JsonSerializer.Serialize(config);
            ef.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ===============================
        // GET ADMIN
        // ===============================
        public async Task<HospedajesAdminGetResponseDTO> GetAdminAsync(long id_usuario, long id_evento)
        {
            bool pertenece = await PerteneceEventoAsync(id_usuario, id_evento);
            if (!pertenece) throw new UnauthorizedAccessException();

            var ef = await GetOrCreateEventoFeatureHospedajes(id_evento);
            var cfg = ParseConfig(ef.config_json);

            var hospedajes = await _context.Set<ef_evento_hospedajes>()
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento)
                .OrderByDescending(x => x.recomendado)
                .ThenBy(x => x.orden)
                .ToListAsync();

            var ids = hospedajes.Select(x => x.id_hospedaje).ToArray();

            var bloques = await _context.Set<ef_evento_hospedaje_bloques>()
                .AsNoTracking()
                .Where(b => ids.Contains(b.id_hospedaje) && b.activo == true)
                .ToListAsync();

            var items = new List<HospedajeDTO>();

            foreach (var h in hospedajes)
            {
                var b = bloques.FirstOrDefault(x => x.id_hospedaje == h.id_hospedaje);

                items.Add(new HospedajeDTO
                {
                    id_hospedaje = h.id_hospedaje,
                    id_evento = h.id_evento,
                    nombre = h.nombre,
                    tipo = h.tipo,
                    zona = h.zona,
                    direccion = h.direccion,
                    url_externa = h.url_externa,
                    telefono = h.telefono,
                    whatsapp = h.whatsapp,
                    latitud = h.latitud,
                    longitud = h.longitud,
                    id_tramo_referencia = h.id_tramo_referencia,
                    precio_desde = h.precio_desde,
                    precio_hasta = h.precio_hasta,
                    moneda = h.moneda,
                    etiquetas = (h.etiquetas ?? Array.Empty<string>()).ToList(),
                    nota_publica = h.nota_publica,
                    recomendado = h.recomendado,
                    orden = h.orden,
                    activo = h.activo,
                    bloque = (b == null) ? null : new HospedajeBloqueDTO
                    {
                        nombre_reserva = b.nombre_reserva,
                        codigo_promocional = b.codigo_promocional,
                        fecha_limite_reserva = b.fecha_limite_reserva,
                        condiciones = b.condiciones,
                        url_bloque = b.url_bloque,
                        activo = b.activo
                    }
                });
            }

            return new HospedajesAdminGetResponseDTO
            {
                id_evento = id_evento,
                config = cfg,
                items = items
            };
        }

        // ===============================
        // UPSERT
        // ===============================
        public async Task<long> UpsertAsync(long id_usuario, long id_evento, HospedajeUpsertRequestDTO req)
        {
            bool pertenece = await PerteneceEventoAsync(id_usuario, id_evento);
            if (!pertenece) throw new UnauthorizedAccessException();

            if (string.IsNullOrWhiteSpace(req.nombre))
                throw new Exception("El nombre es obligatorio.");

            // Normalizar etiquetas (códigos)
            var etiquetas = (req.etiquetas ?? new List<string>())
                .Select(x => (x ?? "").Trim().ToUpperInvariant())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToArray();

            // Recomendado único: si viene recomendado=true, apaga otros recomendados activos
            if (req.recomendado)
            {
                var otros = await _context.Set<ef_evento_hospedajes>()
                    .Where(x => x.id_evento == id_evento && x.activo == true && x.recomendado == true)
                    .ToListAsync();

                foreach (var o in otros)
                {
                    o.recomendado = false;
                    o.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            ef_evento_hospedajes entity;

            if (req.id_hospedaje.HasValue && req.id_hospedaje.Value > 0)
            {
                entity = await _context.Set<ef_evento_hospedajes>()
                    .SingleOrDefaultAsync(x => x.id_evento == id_evento && x.id_hospedaje == req.id_hospedaje.Value);

                if (entity == null) throw new Exception("Hospedaje inexistente.");

                entity.fecha_modif = DateTimeOffset.UtcNow;
            }
            else
            {
                entity = new ef_evento_hospedajes
                {
                    id_evento = id_evento,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.Set<ef_evento_hospedajes>().Add(entity);
            }

            entity.nombre = req.nombre.Trim();
            entity.tipo = string.IsNullOrWhiteSpace(req.tipo) ? null : req.tipo.Trim().ToUpperInvariant();

            entity.zona = string.IsNullOrWhiteSpace(req.zona) ? null : req.zona.Trim();
            entity.direccion = string.IsNullOrWhiteSpace(req.direccion) ? null : req.direccion.Trim();

            entity.url_externa = string.IsNullOrWhiteSpace(req.url_externa) ? null : req.url_externa.Trim();
            entity.telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim();
            entity.whatsapp = string.IsNullOrWhiteSpace(req.whatsapp) ? null : req.whatsapp.Trim();

            entity.latitud = req.latitud;
            entity.longitud = req.longitud;
            entity.id_tramo_referencia = req.id_tramo_referencia;

            entity.precio_desde = req.precio_desde;
            entity.precio_hasta = req.precio_hasta;
            entity.moneda = string.IsNullOrWhiteSpace(req.moneda) ? null : req.moneda.Trim().ToUpperInvariant();

            entity.etiquetas = etiquetas;
            entity.nota_publica = string.IsNullOrWhiteSpace(req.nota_publica) ? null : req.nota_publica.Trim();

            entity.recomendado = req.recomendado;
            entity.orden = req.orden <= 0 ? (short)1 : req.orden;
            entity.activo = req.activo;

            await _context.SaveChangesAsync();

            // Upsert bloque (si viene)
            if (req.bloque != null)
            {
                var bloq = await _context.Set<ef_evento_hospedaje_bloques>()
                    .SingleOrDefaultAsync(x => x.id_hospedaje == entity.id_hospedaje);

                if (bloq == null)
                {
                    bloq = new ef_evento_hospedaje_bloques
                    {
                        id_hospedaje = entity.id_hospedaje,
                        fecha_alta = DateTimeOffset.UtcNow
                    };
                    _context.Set<ef_evento_hospedaje_bloques>().Add(bloq);
                }

                bloq.nombre_reserva = string.IsNullOrWhiteSpace(req.bloque.nombre_reserva) ? null : req.bloque.nombre_reserva.Trim();
                bloq.codigo_promocional = string.IsNullOrWhiteSpace(req.bloque.codigo_promocional) ? null : req.bloque.codigo_promocional.Trim();
                bloq.fecha_limite_reserva = req.bloque.fecha_limite_reserva;
                bloq.condiciones = string.IsNullOrWhiteSpace(req.bloque.condiciones) ? null : req.bloque.condiciones.Trim();
                bloq.url_bloque = string.IsNullOrWhiteSpace(req.bloque.url_bloque) ? null : req.bloque.url_bloque.Trim();
                bloq.activo = req.bloque.activo;
                bloq.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
            }

            return entity.id_hospedaje;
        }

        // ===============================
        // DELETE
        // ===============================
        public async Task<bool> DeleteAsync(long id_usuario, long id_evento, long id_hospedaje)
        {
            bool pertenece = await PerteneceEventoAsync(id_usuario, id_evento);
            if (!pertenece) throw new UnauthorizedAccessException();

            var entity = await _context.Set<ef_evento_hospedajes>()
                .SingleOrDefaultAsync(x => x.id_evento == id_evento && x.id_hospedaje == id_hospedaje);

            if (entity == null) return false;

            _context.Set<ef_evento_hospedajes>().Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===============================
        // PUBLIC: SOLO_CONFIRMADOS (rsvp_token)
        // ===============================
        private async Task<bool> InvitadoConfirmadoAsync(long id_evento, string? rsvp_token)
        {
            if (string.IsNullOrWhiteSpace(rsvp_token))
                return false;

            var inv = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento && x.rsvp_token == rsvp_token)
                .Select(x => new { x.rsvp_estado })
                .FirstOrDefaultAsync();

            return inv != null && inv.rsvp_estado == "Y";
        }

        public async Task<HospedajesPublicGetResponseDTO> GetPublicAsync(long id_evento, string? rsvp_token)
        {
            var ef = await GetOrCreateEventoFeatureHospedajes(id_evento);
            var cfg = ParseConfig(ef.config_json);

            cfg.visibilidad = (cfg.visibilidad ?? "PUBLICO").Trim().ToUpperInvariant();
            var vis = (cfg.visibilidad == "SOLO_CONFIRMADOS") ? "SOLO_CONFIRMADOS" : "PUBLICO";

            bool puede_ver = true;
            string? mensaje = null;

            if (vis == "SOLO_CONFIRMADOS")
            {
                puede_ver = await InvitadoConfirmadoAsync(id_evento, rsvp_token);
                if (!puede_ver)
                    mensaje = "Confirmá tu asistencia para ver los hospedajes sugeridos.";
            }

            var resp = new HospedajesPublicGetResponseDTO
            {
                id_evento = id_evento,
                visibilidad = vis,
                puede_ver = puede_ver,
                mensaje_bloqueo = mensaje,
                mostrar_mapa = cfg.mostrar_mapa
            };

            if (!cfg.mostrar_en_invitacion || !puede_ver)
                return resp;

            var hospedajes = await _context.Set<ef_evento_hospedajes>()
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento && x.activo == true)
                .OrderByDescending(x => x.recomendado)
                .ThenBy(x => x.orden)
                .ToListAsync();

            var ids = hospedajes.Select(x => x.id_hospedaje).ToArray();

            var bloques = await _context.Set<ef_evento_hospedaje_bloques>()
                .AsNoTracking()
                .Where(b => ids.Contains(b.id_hospedaje) && b.activo == true)
                .ToListAsync();

            foreach (var h in hospedajes)
            {
                var b = bloques.FirstOrDefault(x => x.id_hospedaje == h.id_hospedaje);

                resp.items.Add(new HospedajeDTO
                {
                    id_hospedaje = h.id_hospedaje,
                    id_evento = h.id_evento,
                    nombre = h.nombre,
                    tipo = h.tipo,
                    zona = h.zona,
                    direccion = h.direccion,
                    url_externa = h.url_externa,
                    telefono = h.telefono,
                    whatsapp = h.whatsapp,
                    latitud = h.latitud,
                    longitud = h.longitud,
                    id_tramo_referencia = h.id_tramo_referencia,
                    precio_desde = h.precio_desde,
                    precio_hasta = h.precio_hasta,
                    moneda = h.moneda,
                    etiquetas = (h.etiquetas ?? Array.Empty<string>()).ToList(),
                    nota_publica = h.nota_publica,
                    recomendado = h.recomendado,
                    orden = h.orden,
                    activo = h.activo,
                    bloque = (b == null) ? null : new HospedajeBloqueDTO
                    {
                        nombre_reserva = b.nombre_reserva,
                        codigo_promocional = b.codigo_promocional,
                        fecha_limite_reserva = b.fecha_limite_reserva,
                        condiciones = b.condiciones,
                        url_bloque = b.url_bloque,
                        activo = b.activo
                    }
                });
            }

            return resp;
        }

        // ===============================
        // PDF (Guía)
        // ===============================
        public async Task<byte[]> BuildGuiaPdfAsync(long id_evento, string? rsvp_token)
        {
            var data = await GetPublicAsync(id_evento, rsvp_token);

            if (!data.puede_ver)
                throw new UnauthorizedAccessException(data.mensaje_bloqueo ?? "No autorizado.");

            if (data.items == null || data.items.Count == 0)
                throw new Exception("No hay hospedajes para generar guía.");

            QuestPDF.Settings.License = LicenseType.Community;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("Guía de Hospedajes").FontSize(18).SemiBold();
                        col.Item().Text($"Evento: {id_evento}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        col.Item().LineHorizontal(1);
                    });

                    page.Content().Column(col =>
                    {
                        foreach (var h in data.items.OrderByDescending(x => x.recomendado).ThenBy(x => x.orden))
                        {
                            col.Item().PaddingBottom(8).Column(x =>
                            {
                                x.Item().Text(h.recomendado ? $"⭐ {h.nombre}" : h.nombre).SemiBold();
                                if (!string.IsNullOrWhiteSpace(h.zona)) x.Item().Text($"Zona: {h.zona}");
                                if (!string.IsNullOrWhiteSpace(h.direccion)) x.Item().Text($"Dirección: {h.direccion}");
                                if (!string.IsNullOrWhiteSpace(h.url_externa)) x.Item().Text($"Link: {h.url_externa}").FontSize(9);
                                if (h.etiquetas != null && h.etiquetas.Count > 0) x.Item().Text($"Etiquetas: {string.Join(", ", h.etiquetas)}").FontSize(9);

                                if (h.bloque != null && h.bloque.activo)
                                {
                                    var linea = "Tarifa especial";
                                    if (!string.IsNullOrWhiteSpace(h.bloque.codigo_promocional)) linea += $" · Código: {h.bloque.codigo_promocional}";
                                    if (h.bloque.fecha_limite_reserva.HasValue) linea += $" · Hasta: {h.bloque.fecha_limite_reserva:yyyy-MM-dd}";
                                    x.Item().Text(linea).FontSize(9);
                                }
                            });
                        }
                    });

                    page.Footer().AlignCenter().Text("Eventia").FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            }).GeneratePdf();

            return pdf;
        }
    }
}