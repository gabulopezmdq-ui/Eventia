using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class RegalosPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "REGALOS";

        public RegalosPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            var result = new EventoPortalRegalosDTO
            {
                transferencias_habilitado = false,
                lista_habilitado = false,
                fondo_metas_habilitado = false,
                config = null,
                transferencias = null,
                lista = null,
                fondo = null,
                metas = null
            };

            bool puedeTransferencias = await TieneFeatureActivaCentroAsync(context.IdEvento, "REGALOS_TRANSFERENCIAS");
            bool puedeLista = await TieneFeatureActivaCentroAsync(context.IdEvento, "REGALOS_LISTA");
            bool puedeFondoMetas = await TieneFeatureActivaCentroAsync(context.IdEvento, "REGALOS_FONDO_METAS");

            result.transferencias_habilitado = puedeTransferencias;
            result.lista_habilitado = puedeLista;
            result.fondo_metas_habilitado = puedeFondoMetas;

            if (puedeTransferencias)
            {
                result.config = await GetTransferenciasConfigAsync(context.IdEvento);
                result.transferencias = await GetTransferenciasAsync(context.IdEvento);
            }

            if (puedeLista)
            {
                result.lista = await GetListaAsync(context.IdEvento);
            }

            if (puedeFondoMetas)
            {
                result.fondo = await GetFondoAsync(context.IdEvento);

                if (result.fondo != null)
                    result.metas = await GetMetasAsync(context.IdEvento);
                else
                    result.metas = new List<EventoPortalRegaloMetaDTO>();
            }

            return result;
        }

        private async Task<bool> TieneFeatureActivaCentroAsync(long idEvento, string codigoFeature)
        {
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                return false;

            bool esPrograma = string.Equals(
                evento.tipo_operacion,
                "PROGRAMA",
                StringComparison.OrdinalIgnoreCase);

            var result = await (
                from ef in _context.ef_evento_features.AsNoTracking()
                join f in _context.ef_param_features.AsNoTracking()
                    on ef.id_feature equals f.id_feature
                join v0 in _context.ef_evento_feature_visibilidad.AsNoTracking()
                    on new { ef.id_evento, ef.id_feature }
                    equals new { v0.id_evento, v0.id_feature } into gj
                from v in gj.DefaultIfEmpty()
                where ef.id_evento == idEvento
                   && ef.activo == true
                   && f.activo == true
                   && f.codigo == codigoFeature
                select esPrograma
                    ? (v.visible_centro_programa ?? f.visible_centro_programa_default)
                    : (v.visible_centro_evento ?? f.visible_centro_evento_default)
            ).FirstOrDefaultAsync();

            return result;
        }

        private async Task<EventoPortalRegalosTransferenciasConfigDTO> GetTransferenciasConfigAsync(long idEvento)
        {
            var config = await _context.ef_evento_regalos_transferencias_config
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .Select(x => new EventoPortalRegalosTransferenciasConfigDTO
                {
                    id_evento = x.id_evento,
                    titulo = x.titulo,
                    texto_intro = x.texto_intro,
                    activo = x.activo
                })
                .FirstOrDefaultAsync();

            if (config != null)
                return config;

            return new EventoPortalRegalosTransferenciasConfigDTO
            {
                id_evento = idEvento,
                titulo = "Regalos",
                texto_intro = null,
                activo = true
            };
        }

        private async Task<List<EventoPortalRegaloTransferenciaDTO>> GetTransferenciasAsync(long idEvento)
        {
            return await _context.ef_evento_regalos_transferencias
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true)
                .OrderBy(x => x.orden)
                .ThenBy(x => x.id_evento_regalo_transferencia)
                .Select(x => new EventoPortalRegaloTransferenciaDTO
                {
                    id_evento_regalo_transferencia = x.id_evento_regalo_transferencia,
                    id_evento = x.id_evento,
                    codigo_moneda = x.codigo_moneda,
                    titulo = x.titulo,
                    datos_transferencia_texto = x.datos_transferencia_texto,
                    instrucciones = x.instrucciones,
                    orden = x.orden,
                    activo = x.activo
                })
                .ToListAsync();
        }

        private async Task<List<EventoPortalRegaloListaItemDTO>> GetListaAsync(long idEvento)
        {
            var reservasActivas = await _context.ef_evento_regalos_lista_reservas
                .AsNoTracking()
                .Where(r =>
                    r.id_evento == idEvento &&
                    r.activo == true &&
                    r.estado == "RESERVA_ACTIVA")
                .GroupBy(r => r.id_regalo_item)
                .Select(g => new
                {
                    id_regalo_item = g.Key,
                    cantidad_reservada = g.Sum(x => x.cantidad)
                })
                .ToListAsync();

            var reservasByItem = reservasActivas
                .ToDictionary(x => x.id_regalo_item, x => x.cantidad_reservada);

            var items = await _context.ef_evento_regalos_lista_items
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true &&
                    x.visible == true)
                .OrderBy(x => x.orden)
                .ThenBy(x => x.id_regalo_item)
                .Select(x => new
                {
                    x.id_regalo_item,
                    x.id_evento,
                    x.titulo,
                    x.descripcion,
                    x.cantidad_total,
                    x.url_referencia,
                    x.imagen_url,
                    x.orden,
                    x.visible,
                    x.activo
                })
                .ToListAsync();

            var result = new List<EventoPortalRegaloListaItemDTO>();

            foreach (var item in items)
            {
                int reservadas = reservasByItem.ContainsKey(item.id_regalo_item)
                    ? reservasByItem[item.id_regalo_item]
                    : 0;

                int disponibles = item.cantidad_total - reservadas;
                if (disponibles < 0) disponibles = 0;

                result.Add(new EventoPortalRegaloListaItemDTO
                {
                    id_regalo_item = item.id_regalo_item,
                    id_evento = item.id_evento,
                    titulo = item.titulo,
                    descripcion = item.descripcion,
                    cantidad_total = item.cantidad_total,
                    cantidad_reservada = reservadas,
                    cantidad_disponible = disponibles,
                    url_referencia = item.url_referencia,
                    imagen_url = item.imagen_url,
                    orden = item.orden,
                    visible = item.visible,
                    activo = item.activo
                });
            }

            return result;
        }

        private async Task<EventoPortalRegaloFondoDTO?> GetFondoAsync(long idEvento)
        {
            return await _context.ef_evento_regalos_fondos
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true)
                .OrderBy(x => x.id_fondo)
                .Select(x => new EventoPortalRegaloFondoDTO
                {
                    id_fondo = x.id_fondo,
                    id_evento = x.id_evento,
                    titulo = x.titulo,
                    descripcion_publica = x.descripcion_publica,
                    moneda_base = x.moneda_base,
                    modo_confirmacion = x.modo_confirmacion,
                    permitir_excedente = x.permitir_excedente,
                    mostrar_pendientes = x.mostrar_pendientes,
                    mostrar_muro_mensajes = x.mostrar_muro_mensajes,
                    permitir_anonimo = x.permitir_anonimo,
                    activo = x.activo
                })
                .FirstOrDefaultAsync();
        }

        private async Task<List<EventoPortalRegaloMetaDTO>> GetMetasAsync(long idEvento)
        {
            var aportes = await _context.ef_evento_regalos_fondo_aportes
                .AsNoTracking()
                .Where(a =>
                    a.id_evento == idEvento &&
                    a.activo == true)
                .GroupBy(a => a.id_meta)
                .Select(g => new
                {
                    id_meta = g.Key,
                    total_confirmado = g
                        .Where(x => x.estado == "CONFIRMADO")
                        .Sum(x => x.monto_base_calculado ?? 0),
                    total_pendiente = g
                        .Where(x => x.estado == "DECLARADO" || x.estado == "PENDIENTE_CONFIRMACION")
                        .Sum(x => x.monto_aporte ?? 0)
                })
                .ToListAsync();

            var aportesByMeta = aportes.ToDictionary(x => x.id_meta);

            var metas = await _context.ef_evento_regalos_fondo_metas
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true &&
                    x.visible == true)
                .OrderBy(x => x.orden)
                .ThenBy(x => x.id_meta)
                .Select(x => new
                {
                    x.id_meta,
                    x.id_evento,
                    x.id_fondo,
                    x.tipo_meta,
                    x.titulo,
                    x.descripcion,
                    x.objetivo_monto,
                    x.url_referencia,
                    x.imagen_url,
                    x.orden,
                    x.visible,
                    x.activo
                })
                .ToListAsync();

            var result = new List<EventoPortalRegaloMetaDTO>();

            foreach (var meta in metas)
            {
                decimal totalConfirmado = 0;
                decimal totalPendiente = 0;

                if (aportesByMeta.ContainsKey(meta.id_meta))
                {
                    totalConfirmado = aportesByMeta[meta.id_meta].total_confirmado;
                    totalPendiente = aportesByMeta[meta.id_meta].total_pendiente;
                }

                decimal porcentaje = 0;

                if (meta.objetivo_monto > 0)
                {
                    porcentaje = Math.Round((totalConfirmado * 100) / meta.objetivo_monto, 2);
                    if (porcentaje > 100) porcentaje = 100;
                }

                result.Add(new EventoPortalRegaloMetaDTO
                {
                    id_meta = meta.id_meta,
                    id_evento = meta.id_evento,
                    id_fondo = meta.id_fondo,
                    tipo_meta = meta.tipo_meta,
                    titulo = meta.titulo,
                    descripcion = meta.descripcion,
                    objetivo_monto = meta.objetivo_monto,
                    total_confirmado = totalConfirmado,
                    total_pendiente = totalPendiente,
                    porcentaje = porcentaje,
                    url_referencia = meta.url_referencia,
                    imagen_url = meta.imagen_url,
                    orden = meta.orden,
                    visible = meta.visible,
                    activo = meta.activo
                });
            }

            return result;
        }
    }

    public class EventoPortalRegalosDTO
    {
        public bool transferencias_habilitado { get; set; }
        public bool lista_habilitado { get; set; }
        public bool fondo_metas_habilitado { get; set; }

        public EventoPortalRegalosTransferenciasConfigDTO? config { get; set; }
        public List<EventoPortalRegaloTransferenciaDTO>? transferencias { get; set; }
        public List<EventoPortalRegaloListaItemDTO>? lista { get; set; }
        public EventoPortalRegaloFondoDTO? fondo { get; set; }
        public List<EventoPortalRegaloMetaDTO>? metas { get; set; }
    }

    public class EventoPortalRegalosTransferenciasConfigDTO
    {
        public long id_evento { get; set; }
        public string titulo { get; set; } = "Regalos";
        public string? texto_intro { get; set; }
        public bool activo { get; set; }
    }

    public class EventoPortalRegaloTransferenciaDTO
    {
        public long id_evento_regalo_transferencia { get; set; }
        public long id_evento { get; set; }
        public string codigo_moneda { get; set; } = string.Empty;
        public string? titulo { get; set; }
        public string datos_transferencia_texto { get; set; } = string.Empty;
        public string? instrucciones { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }
    }

    public class EventoPortalRegaloListaItemDTO
    {
        public long id_regalo_item { get; set; }
        public long id_evento { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public int cantidad_total { get; set; }
        public int cantidad_reservada { get; set; }
        public int cantidad_disponible { get; set; }
        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }
        public short orden { get; set; }
        public bool visible { get; set; }
        public bool activo { get; set; }
    }

    public class EventoPortalRegaloFondoDTO
    {
        public long id_fondo { get; set; }
        public long id_evento { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string? descripcion_publica { get; set; }
        public string moneda_base { get; set; } = string.Empty;
        public string modo_confirmacion { get; set; } = string.Empty;
        public bool permitir_excedente { get; set; }
        public bool mostrar_pendientes { get; set; }
        public bool mostrar_muro_mensajes { get; set; }
        public bool permitir_anonimo { get; set; }
        public bool activo { get; set; }
    }

    public class EventoPortalRegaloMetaDTO
    {
        public long id_meta { get; set; }
        public long id_evento { get; set; }
        public long id_fondo { get; set; }
        public string tipo_meta { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public decimal objetivo_monto { get; set; }
        public decimal total_confirmado { get; set; }
        public decimal total_pendiente { get; set; }
        public decimal porcentaje { get; set; }
        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }
        public short orden { get; set; }
        public bool visible { get; set; }
        public bool activo { get; set; }
    }
}