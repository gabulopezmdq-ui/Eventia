using API.DataSchema;
using API.DataSchema.DTO.Regalos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Regalos
{
    public class RegalosPublicBundleService : IRegalosPublicBundleService
    {
        private readonly DataContext _context;

        public RegalosPublicBundleService(DataContext context)
        {
            _context = context;
        }

        public async Task<RegalosPublicBundleDTO?> GetBundleByInvitadoTokenAsync(string rsvp_token)
        {
            if (string.IsNullOrWhiteSpace(rsvp_token)) return null;
            rsvp_token = rsvp_token.Trim();

            // 1) Resolver invitado por token -> id_evento
            var invitado = await _context.ef_invitados
                .AsNoTracking()
                .Where(i => i.rsvp_token == rsvp_token && i.activo == true)
                .Select(i => new { i.id_invitado, i.id_evento })
                .FirstOrDefaultAsync();

            if (invitado == null) return null;

            long idEvento = invitado.id_evento;

            // 2) Features (estricto por feature)
            bool featTransfer = await IsFeatureActivaAsync(idEvento, "REGALOS_TRANSFERENCIAS");
            bool featLista = await IsFeatureActivaAsync(idEvento, "REGALOS_LISTA");
            bool featFondo = await IsFeatureActivaAsync(idEvento, "REGALOS_FONDO_METAS");

            var dto = new RegalosPublicBundleDTO
            {
                id_evento = idEvento,
                id_invitado = invitado.id_invitado,
                rsvp_token = rsvp_token,
                mostrar_transferencias = featTransfer,
                mostrar_lista = featLista,
                mostrar_fondo = featFondo,
                transferencias = new List<RegalosPublicTransferenciaDTO>()
            };

            // 3) Transferencias
            if (featTransfer)
            {
                dto.transferencias = await _context.ef_evento_regalos_transferencias
                    .AsNoTracking()
                    .Where(x => x.id_evento == idEvento && x.activo == true)
                    .OrderBy(x => x.orden)
                    .Select(x => new RegalosPublicTransferenciaDTO
                    {
                        codigo_moneda = x.codigo_moneda,
                        titulo = x.titulo,
                        datos_transferencia_texto = x.datos_transferencia_texto,
                        instrucciones = x.instrucciones,
                        orden = x.orden
                    })
                    .ToListAsync();

                // Si querés 100% estricto por feature, NO hagas override por "no hay registros".
                // dto.mostrar_transferencias = dto.transferencias.Count > 0;
            }

            // 4) Lista
            if (featLista)
            {
                var items = await _context.ef_evento_regalos_lista_items
                    .AsNoTracking()
                    .Where(i => i.id_evento == idEvento && i.activo == true && i.visible == true)
                    .OrderBy(i => i.orden)
                    .Select(i => new { i.id_regalo_item, i.titulo, i.descripcion, i.cantidad_total, i.orden })
                    .ToListAsync();

                var reservas = await _context.ef_evento_regalos_lista_reservas
                    .AsNoTracking()
                    .Where(r => r.id_evento == idEvento && r.activo == true && r.estado == "RESERVA_ACTIVA")
                    .GroupBy(r => r.id_regalo_item)
                    .Select(g => new { id_regalo_item = g.Key, cant = g.Sum(x => x.cantidad) })
                    .ToListAsync();

                var map = reservas.ToDictionary(x => x.id_regalo_item, x => x.cant);

                dto.lista = new RegalosPublicListaDTO
                {
                    items = items.Select(i =>
                    {
                        int reservada = map.TryGetValue(i.id_regalo_item, out var c) ? c : 0;
                        int disponible = Math.Max(0, i.cantidad_total - reservada);

                        return new RegalosPublicListaItemDTO
                        {
                            id_regalo_item = i.id_regalo_item,
                            titulo = i.titulo,
                            descripcion = i.descripcion,
                            cantidad_total = i.cantidad_total,
                            cantidad_reservada = reservada,
                            cantidad_disponible = disponible,
                            orden = i.orden
                        };
                    }).ToList()
                };
            }

            // 5) Fondo
            if (featFondo)
            {
                var fondo = await _context.ef_evento_regalos_fondos
                    .AsNoTracking()
                    .Where(f => f.id_evento == idEvento && f.activo == true)
                    .OrderByDescending(f => f.fecha_alta)
                    .FirstOrDefaultAsync();

                if (fondo != null)
                {
                    var metas = await _context.ef_evento_regalos_fondo_metas
                        .AsNoTracking()
                        .Where(m => m.id_evento == idEvento && m.id_fondo == fondo.id_fondo && m.activo == true && m.visible == true)
                        .OrderBy(m => m.orden)
                        .ToListAsync();

                    var aportes = await _context.ef_evento_regalos_fondo_aportes
                        .AsNoTracking()
                        .Where(a => a.id_evento == idEvento && a.id_fondo == fondo.id_fondo && a.activo == true)
                        .Select(a => new { a.id_meta, a.estado, a.monto_base_calculado })
                        .ToListAsync();

                    bool mostrarPend = fondo.mostrar_pendientes;

                    dto.fondo = new RegalosPublicFondoDTO
                    {
                        config = new RegalosPublicFondoConfigDTO
                        {
                            id_fondo = fondo.id_fondo,
                            titulo = fondo.titulo,
                            descripcion_publica = fondo.descripcion_publica,
                            moneda_base = fondo.moneda_base,
                            modo_confirmacion = fondo.modo_confirmacion,
                            mostrar_pendientes = fondo.mostrar_pendientes,
                            permitir_anonimo = fondo.permitir_anonimo
                        },
                        metas = metas.Select(m =>
                        {
                            decimal confirmado = aportes
                                .Where(a => a.id_meta == m.id_meta && a.estado == "CONFIRMADO")
                                .Sum(a => a.monto_base_calculado ?? 0m);

                            decimal pendiente = 0m;
                            if (mostrarPend)
                            {
                                pendiente = aportes
                                    .Where(a => a.id_meta == m.id_meta && (a.estado == "DECLARADO" || a.estado == "PENDIENTE_CONFIRMACION"))
                                    .Sum(a => a.monto_base_calculado ?? 0m);
                            }

                            decimal porcentaje = 0m;
                            if (m.objetivo_monto > 0m)
                            {
                                porcentaje = confirmado / m.objetivo_monto;
                                if (porcentaje > 1m) porcentaje = 1m;
                            }

                            return new RegalosPublicFondoMetaDTO
                            {
                                id_meta = m.id_meta,
                                titulo = m.titulo,
                                descripcion = m.descripcion,
                                objetivo_monto = m.objetivo_monto,
                                total_confirmado = confirmado,
                                total_pendiente = pendiente,
                                porcentaje = porcentaje,
                                orden = m.orden
                            };
                        }).ToList()
                    };
                }
            }

            return dto;
        }

        private async Task<bool> IsFeatureActivaAsync(long idEvento, string featureCodigo)
        {
            var idFeature = await _context.ef_param_features
                .AsNoTracking()
                .Where(f => f.codigo == featureCodigo && f.activo == true)
                .Select(f => (long?)f.id_feature)
                .FirstOrDefaultAsync();

            if (!idFeature.HasValue) return false;

            // Override por evento
            bool porEvento = await _context.ef_evento_features
                .AsNoTracking()
                .AnyAsync(ef => ef.id_evento == idEvento
                             && ef.id_feature == idFeature.Value
                             && ef.activo == true);

            if (porEvento) return true;

            // Por add-on activo en el evento (scope_addons + addon_features)
            bool porAddon = await (from sa in _context.ef_scope_addons.AsNoTracking()
                                   join af in _context.ef_addon_features.AsNoTracking()
                                     on sa.id_addon equals af.id_addon
                                   where sa.scope == "EVENTO"
                                      && sa.id_evento == idEvento
                                      && sa.activo == true
                                      && sa.estado == "ACTIVO"
                                      && af.activo == true
                                      && af.id_feature == idFeature.Value
                                   select sa.id_scope_addon)
                                  .AnyAsync();

            return porAddon;
        }
    }
}