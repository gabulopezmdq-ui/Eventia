using API.DataSchema;
using API.DataSchema.DTO.Regalos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Regalos
{
    public class RegalosFondoService : IRegalosFondoService
    {
        private readonly DataContext _context;

        public RegalosFondoService(DataContext context)
        {
            _context = context;
        }

        public async Task<RegalosFondoDTO?> GetFondoByEventoAsync(long id_evento)
        {
            var fondo = await _context.ef_evento_regalos_fondos
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento && x.activo == true)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            if (fondo == null) return null;

            return new RegalosFondoDTO
            {
                id_fondo = fondo.id_fondo,
                id_evento = fondo.id_evento,
                titulo = fondo.titulo,
                descripcion_publica = fondo.descripcion_publica,
                moneda_base = fondo.moneda_base,
                modo_confirmacion = fondo.modo_confirmacion,
                permitir_excedente = fondo.permitir_excedente,
                mostrar_pendientes = fondo.mostrar_pendientes,
                mostrar_muro_mensajes = fondo.mostrar_muro_mensajes,
                permitir_anonimo = fondo.permitir_anonimo,
                activo = fondo.activo
            };
        }

        public async Task<RegalosFondoDTO> UpsertFondoAsync(RegalosFondoUpsertDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            if (string.IsNullOrWhiteSpace(req.titulo)) throw new Exception("El título es obligatorio.");

            // Si querés 1 fondo por evento: tomamos el último activo y lo editamos (o creamos)
            var fondo = await _context.ef_evento_regalos_fondos
                .Where(x => x.id_evento == req.id_evento && x.activo == true)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            if (fondo == null)
            {
                fondo = new ef_evento_regalos_fondos
                {
                    id_evento = req.id_evento,
                    fecha_alta = DateTimeOffset.UtcNow,
                    activo = true
                };
                _context.ef_evento_regalos_fondos.Add(fondo);
            }

            fondo.titulo = req.titulo.Trim();
            fondo.descripcion_publica = req.descripcion_publica?.Trim();
            fondo.moneda_base = (req.moneda_base ?? "ARS").Trim().ToUpper();
            fondo.modo_confirmacion = (req.modo_confirmacion ?? "INVITADO_Y_ORGANIZADOR").Trim().ToUpper();

            fondo.permitir_excedente = req.permitir_excedente;
            fondo.mostrar_pendientes = req.mostrar_pendientes;
            fondo.mostrar_muro_mensajes = req.mostrar_muro_mensajes;
            fondo.permitir_anonimo = req.permitir_anonimo;

            fondo.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new RegalosFondoDTO
            {
                id_fondo = fondo.id_fondo,
                id_evento = fondo.id_evento,
                titulo = fondo.titulo,
                descripcion_publica = fondo.descripcion_publica,
                moneda_base = fondo.moneda_base,
                modo_confirmacion = fondo.modo_confirmacion,
                permitir_excedente = fondo.permitir_excedente,
                mostrar_pendientes = fondo.mostrar_pendientes,
                mostrar_muro_mensajes = fondo.mostrar_muro_mensajes,
                permitir_anonimo = fondo.permitir_anonimo,
                activo = fondo.activo
            };
        }

        public async Task<List<RegalosFondoMetaDTO>> ListarMetasAsync(long id_evento)
        {
            var fondo = await _context.ef_evento_regalos_fondos
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento && x.activo == true)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            if (fondo == null) return new List<RegalosFondoMetaDTO>();

            var metas = await _context.ef_evento_regalos_fondo_metas
                .AsNoTracking()
                .Where(m => m.id_evento == id_evento
                            && m.id_fondo == fondo.id_fondo
                            && m.activo == true)
                .OrderBy(m => m.orden)
                .ToListAsync();

            var aportes = await _context.ef_evento_regalos_fondo_aportes
                .AsNoTracking()
                .Where(a => a.id_evento == id_evento
                            && a.id_fondo == fondo.id_fondo
                            && a.activo == true)
                .Select(a => new
                {
                    a.id_meta,
                    a.estado,
                    a.monto_base_calculado
                })
                .ToListAsync();

            bool mostrarPendientes = fondo.mostrar_pendientes;

            return metas.Select(m =>
            {
                decimal confirmado = aportes
                    .Where(a => a.id_meta == m.id_meta && a.estado == "CONFIRMADO")
                    .Sum(a => a.monto_base_calculado ?? 0m);

                decimal pendiente = 0m;
                if (mostrarPendientes)
                {
                    pendiente = aportes
                        .Where(a => a.id_meta == m.id_meta && (a.estado == "DECLARADO" || a.estado == "PENDIENTE_CONFIRMACION"))
                        .Sum(a => a.monto_base_calculado ?? 0m);
                }

                decimal porcentaje = 0m;
                if (m.objetivo_monto > 0m)
                {
                    porcentaje = Math.Round((confirmado / m.objetivo_monto) * 100m, 2);
                }

                return new RegalosFondoMetaDTO
                {
                    id_meta = m.id_meta,
                    id_evento = m.id_evento,
                    id_fondo = m.id_fondo,
                    tipo_meta = m.tipo_meta,
                    titulo = m.titulo,
                    descripcion = m.descripcion,
                    objetivo_monto = m.objetivo_monto,
                    total_confirmado = confirmado,
                    total_pendiente = pendiente,
                    porcentaje = porcentaje,
                    orden = m.orden,
                    visible = m.visible,
                    activo = m.activo
                };
            }).ToList();
        }

        public async Task<RegalosFondoMetaDTO> CrearMetaAsync(RegalosFondoCrearMetaDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            if (req.id_fondo <= 0) throw new Exception("id_fondo inválido.");
            if (string.IsNullOrWhiteSpace(req.titulo)) throw new Exception("El título es obligatorio.");
            if (req.objetivo_monto <= 0) throw new Exception("objetivo_monto inválido.");

            var meta = new ef_evento_regalos_fondo_metas
            {
                id_evento = req.id_evento,
                id_fondo = req.id_fondo,
                tipo_meta = (req.tipo_meta ?? "GENERICA").Trim().ToUpper(),
                titulo = req.titulo.Trim(),
                descripcion = req.descripcion?.Trim(),
                objetivo_monto = req.objetivo_monto,
                url_referencia = req.url_referencia?.Trim(),
                imagen_url = req.imagen_url?.Trim(),
                orden = req.orden,
                visible = req.visible,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_regalos_fondo_metas.Add(meta);
            await _context.SaveChangesAsync();

            return new RegalosFondoMetaDTO
            {
                id_meta = meta.id_meta,
                id_evento = meta.id_evento,
                id_fondo = meta.id_fondo,
                tipo_meta = meta.tipo_meta,
                titulo = meta.titulo,
                descripcion = meta.descripcion,
                objetivo_monto = meta.objetivo_monto,
                total_confirmado = 0m,
                total_pendiente = 0m,
                porcentaje = 0m,
                orden = meta.orden,
                visible = meta.visible,
                activo = meta.activo
            };
        }

        public async Task<bool> SetVisibleMetaAsync(long id_evento, long id_meta, bool visible)
        {
            var meta = await _context.ef_evento_regalos_fondo_metas
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.id_meta == id_meta);

            if (meta == null) return false;

            meta.visible = visible;
            meta.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RegalosFondoAporteDTO> CrearAportePublicoAsync(RegalosFondoCrearAporteDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.id_fondo <= 0) throw new Exception("id_fondo inválido.");
            if (req.id_meta <= 0) throw new Exception("id_meta inválido.");

            // ✅ Seguridad simple: no confiar en id_evento del body si viene rsvp_token
            long idEventoSeguro = req.id_evento;

            if (!string.IsNullOrWhiteSpace(req.rsvp_token))
            {
                var inv = await _context.ef_invitados
                    .AsNoTracking()
                    .Where(i => i.rsvp_token == req.rsvp_token && i.activo == true)
                    .Select(i => new { i.id_evento })
                    .FirstOrDefaultAsync();

                if (inv == null)
                    throw new Exception("Token inválido.");

                idEventoSeguro = inv.id_evento;

                if (req.id_evento > 0 && req.id_evento != idEventoSeguro)
                    throw new Exception("Token no corresponde al evento.");
            }
            else
            {
                // Si no hay token, exigimos id_evento válido (tu decisión permitir o no)
                if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            }

            // Fondo debe pertenecer al evento seguro
            var fondo = await _context.ef_evento_regalos_fondos
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.id_fondo == req.id_fondo
                                       && f.id_evento == idEventoSeguro
                                       && f.activo == true);

            if (fondo == null) throw new Exception("Fondo inexistente.");

            // Meta debe pertenecer al fondo y al evento seguro
            bool metaOk = await _context.ef_evento_regalos_fondo_metas
                .AsNoTracking()
                .AnyAsync(m => m.id_meta == req.id_meta
                            && m.id_fondo == req.id_fondo
                            && m.id_evento == idEventoSeguro
                            && m.activo == true);

            if (!metaOk) throw new Exception("Meta inexistente para este fondo.");

            // Validación según modo
            if (fondo.modo_confirmacion == "INVITADO_Y_ORGANIZADOR")
            {
                if (!req.monto_aporte.HasValue || req.monto_aporte.Value <= 0)
                    throw new Exception("Debe informar un monto de aporte.");

                if (string.IsNullOrWhiteSpace(req.moneda_aporte))
                    throw new Exception("Debe informar moneda del aporte.");
            }

            var aporte = new ef_evento_regalos_fondo_aportes
            {
                id_evento = idEventoSeguro,
                id_fondo = req.id_fondo,
                id_meta = req.id_meta,

                id_invitado = req.id_invitado,
                rsvp_token = req.rsvp_token?.Trim(),

                nombre_mostrado = req.nombre_mostrado?.Trim(),
                es_anonimo = req.es_anonimo,

                monto_aporte = req.monto_aporte,
                moneda_aporte = req.moneda_aporte?.Trim().ToUpper(),

                // moneda_base/calculo: se define al confirmar (especialmente multi-moneda)
                monto_base_calculado = null,
                tipo_cambio_usado = null,

                estado = "DECLARADO",
                mensaje = req.mensaje?.Trim(),
                mostrar_en_muro = req.mostrar_en_muro,

                fecha_declara = DateTimeOffset.UtcNow,
                activo = true
            };

            _context.ef_evento_regalos_fondo_aportes.Add(aporte);
            await _context.SaveChangesAsync();

            return new RegalosFondoAporteDTO
            {
                id_aporte = aporte.id_aporte,
                id_evento = aporte.id_evento,
                id_fondo = aporte.id_fondo,
                id_meta = aporte.id_meta,
                estado = aporte.estado,
                monto_aporte = aporte.monto_aporte,
                moneda_aporte = aporte.moneda_aporte,
                monto_base_calculado = aporte.monto_base_calculado,
                tipo_cambio_usado = aporte.tipo_cambio_usado,
                mensaje = aporte.mensaje,
                es_anonimo = aporte.es_anonimo,
                mostrar_en_muro = aporte.mostrar_en_muro,
                fecha_declara = aporte.fecha_declara,
                fecha_confirma = aporte.fecha_confirma,
                id_usuario_confirma = aporte.id_usuario_confirma
            };
        }

        public async Task<bool> ConfirmarAporteAsync(long id_evento, long id_aporte, long id_usuario_admin, RegalosFondoConfirmarAporteDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.monto_base_calculado <= 0) throw new Exception("monto_base_calculado inválido.");

            var aporte = await _context.ef_evento_regalos_fondo_aportes
                .FirstOrDefaultAsync(a => a.id_evento == id_evento && a.id_aporte == id_aporte);

            if (aporte == null) return false;

            aporte.monto_base_calculado = req.monto_base_calculado;
            aporte.tipo_cambio_usado = req.tipo_cambio_usado;

            aporte.estado = "CONFIRMADO";
            aporte.fecha_confirma = DateTimeOffset.UtcNow;
            aporte.id_usuario_confirma = id_usuario_admin;
            aporte.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<RegalosFondoAporteListItemDTO>> ListarAportesAsync(long id_evento, string? estado = null)
        {
            if (id_evento <= 0) throw new Exception("id_evento inválido.");

            // Tomo el fondo activo (para obtener id_fondo); si no hay, lista vacía
            var fondo = await _context.ef_evento_regalos_fondos
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.activo == true);

            if (fondo == null)
                return new List<RegalosFondoAporteListItemDTO>();

            var q = _context.ef_evento_regalos_fondo_aportes
                .AsNoTracking()
                .Where(a => a.id_evento == id_evento
                         && a.id_fondo == fondo.id_fondo
                         && a.activo == true);

            if (!string.IsNullOrWhiteSpace(estado))
            {
                string st = estado.Trim().ToUpper();
                q = q.Where(a => a.estado.ToUpper() == st);
            }

            // join para traer el título de la meta
            var result = await (
                from a in q
                join m in _context.ef_evento_regalos_fondo_metas.AsNoTracking()
                    on a.id_meta equals m.id_meta
                select new RegalosFondoAporteListItemDTO
                {
                    id_aporte = a.id_aporte,
                    id_evento = a.id_evento,
                    id_fondo = a.id_fondo,
                    id_meta = a.id_meta,
                    meta_titulo = m.titulo,

                    estado = a.estado,

                    monto_aporte = a.monto_aporte,
                    moneda_aporte = a.moneda_aporte,

                    monto_base_calculado = a.monto_base_calculado,
                    tipo_cambio_usado = a.tipo_cambio_usado,

                    nombre_mostrado = a.nombre_mostrado,
                    es_anonimo = a.es_anonimo,

                    mensaje = a.mensaje,
                    mostrar_en_muro = a.mostrar_en_muro,

                    fecha_declara = a.fecha_declara,
                    fecha_confirma = a.fecha_confirma,
                    id_usuario_confirma = a.id_usuario_confirma,

                    activo = a.activo
                }
            )
            .OrderByDescending(x => x.fecha_declara)
            .ThenByDescending(x => x.id_aporte)
            .ToListAsync();

            return result;
        }

        public async Task<bool> UpdateMetaAsync(long id_evento, long id_meta, RegalosFondoUpdateMetaDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (id_evento <= 0) throw new Exception("id_evento inválido.");
            if (id_meta <= 0) throw new Exception("id_meta inválido.");
            if (string.IsNullOrWhiteSpace(req.titulo)) throw new Exception("El título es obligatorio.");
            if (req.objetivo_monto <= 0) throw new Exception("objetivo_monto inválido.");
            if (req.orden <= 0) throw new Exception("orden inválido.");

            var meta = await _context.ef_evento_regalos_fondo_metas
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.id_meta == id_meta);

            if (meta == null) return false;

            meta.titulo = req.titulo.Trim();
            meta.descripcion = req.descripcion?.Trim();
            meta.objetivo_monto = req.objetivo_monto;
            meta.orden = req.orden;
            meta.visible = req.visible;
            meta.url_referencia = req.url_referencia?.Trim();
            meta.imagen_url = req.imagen_url?.Trim();
            meta.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}