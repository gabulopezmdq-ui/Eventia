using API.DataSchema;
using API.DataSchema.DTO.Regalos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Regalos
{
    public class RegalosListaService : IRegalosListaService
    {
        private readonly DataContext _context;

        public RegalosListaService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<RegalosListaItemDTO>> ListarItemsAsync(long id_evento)
        {
            var items = await _context.ef_evento_regalos_lista_items
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento && x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var reservasActivas = await _context.ef_evento_regalos_lista_reservas
                .AsNoTracking()
                .Where(r => r.id_evento == id_evento
                            && r.activo == true
                            && r.estado == "RESERVA_ACTIVA")
                .GroupBy(r => r.id_regalo_item)
                .Select(g => new { id_regalo_item = g.Key, cant = g.Sum(x => x.cantidad) })
                .ToListAsync();

            var map = reservasActivas.ToDictionary(x => x.id_regalo_item, x => x.cant);

            return items.Select(i =>
            {
                int reservada = map.TryGetValue(i.id_regalo_item, out var c) ? c : 0;
                int disponible = Math.Max(0, i.cantidad_total - reservada);

                return new RegalosListaItemDTO
                {
                    id_regalo_item = i.id_regalo_item,
                    id_evento = i.id_evento,
                    titulo = i.titulo,
                    descripcion = i.descripcion,
                    cantidad_total = i.cantidad_total,
                    cantidad_reservada = reservada,
                    cantidad_disponible = disponible,
                    orden = i.orden,
                    visible = i.visible,
                    activo = i.activo
                };
            }).ToList();
        }

        public async Task<RegalosListaItemDTO> CrearItemAsync(RegalosListaCrearItemDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            if (string.IsNullOrWhiteSpace(req.titulo)) throw new Exception("El título es obligatorio.");
            if (req.cantidad_total <= 0) throw new Exception("cantidad_total inválida.");

            var entity = new ef_evento_regalos_lista_items
            {
                id_evento = req.id_evento,
                titulo = req.titulo.Trim(),
                descripcion = req.descripcion?.Trim(),
                cantidad_total = req.cantidad_total,
                permitir_excedente = req.permitir_excedente,
                url_referencia = req.url_referencia?.Trim(),
                imagen_url = req.imagen_url?.Trim(),
                orden = req.orden,
                visible = req.visible,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_regalos_lista_items.Add(entity);
            await _context.SaveChangesAsync();

            return new RegalosListaItemDTO
            {
                id_regalo_item = entity.id_regalo_item,
                id_evento = entity.id_evento,
                titulo = entity.titulo,
                descripcion = entity.descripcion,
                cantidad_total = entity.cantidad_total,
                cantidad_reservada = 0,
                cantidad_disponible = entity.cantidad_total,
                orden = entity.orden,
                visible = entity.visible,
                activo = entity.activo
            };
        }

        public async Task<bool> SetVisibleItemAsync(long id_evento, long id_regalo_item, bool visible)
        {
            var item = await _context.ef_evento_regalos_lista_items
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.id_regalo_item == id_regalo_item);

            if (item == null) return false;

            item.visible = visible;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RegalosListaReservaDTO> ReservarAsync(RegalosListaReservarDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (req.id_regalo_item <= 0) throw new Exception("id_regalo_item inválido.");
            if (req.cantidad <= 0) throw new Exception("cantidad inválida.");

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

                // Si el front mandó id_evento, tiene que coincidir con el token
                if (req.id_evento > 0 && req.id_evento != idEventoSeguro)
                    throw new Exception("Token no corresponde al evento.");
            }
            else
            {
                // Si NO viene token, al menos exigimos id_evento válido.
                if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            }

            // Sin vencimiento automático: no seteamos fecha_vencimiento jamás.
            using var tx = await _context.Database.BeginTransactionAsync();

            // lock del item para evitar carreras (usa idEventoSeguro)
            var item = await _context.ef_evento_regalos_lista_items
                .FromSqlInterpolated($@"
            select * 
            from public.ef_evento_regalos_lista_items
            where id_regalo_item = {req.id_regalo_item} and id_evento = {idEventoSeguro}
            for update")
                .FirstOrDefaultAsync();

            if (item == null || item.activo != true || item.visible != true)
                throw new Exception("Item no disponible.");

            int reservada = await _context.ef_evento_regalos_lista_reservas
                .Where(r => r.id_evento == idEventoSeguro
                            && r.id_regalo_item == req.id_regalo_item
                            && r.activo == true
                            && r.estado == "RESERVA_ACTIVA")
                .SumAsync(r => (int?)r.cantidad) ?? 0;

            int disponible = item.cantidad_total - reservada;

            if (!item.permitir_excedente && req.cantidad > disponible)
                throw new Exception("No hay disponibilidad para reservar ese regalo.");

            var reserva = new ef_evento_regalos_lista_reservas
            {
                id_evento = idEventoSeguro,
                id_regalo_item = req.id_regalo_item,

                // Guardamos lo que venga (si vino token, queda auditado)
                id_invitado = req.id_invitado,
                rsvp_token = req.rsvp_token?.Trim(),
                nombre_mostrado = req.nombre_mostrado?.Trim(),
                es_anonimo = req.es_anonimo,

                cantidad = req.cantidad,
                estado = "RESERVA_ACTIVA",
                mensaje = req.mensaje?.Trim(),

                fecha_reserva = DateTimeOffset.UtcNow,
                // fecha_vencimiento = null (no vencimiento)
                activo = true
            };

            _context.ef_evento_regalos_lista_reservas.Add(reserva);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();

            return new RegalosListaReservaDTO
            {
                id_reserva = reserva.id_reserva,
                id_evento = reserva.id_evento,
                id_regalo_item = reserva.id_regalo_item,
                cantidad = reserva.cantidad,
                estado = reserva.estado,
                mensaje = reserva.mensaje,
                fecha_reserva = reserva.fecha_reserva
            };
        }

        public async Task<bool> CancelarReservaAsync(long id_evento, long id_reserva)
        {
            var reserva = await _context.ef_evento_regalos_lista_reservas
                .FirstOrDefaultAsync(r => r.id_evento == id_evento && r.id_reserva == id_reserva);

            if (reserva == null) return false;

            // idempotente
            if (reserva.estado != "RESERVA_ACTIVA")
                return true;

            reserva.estado = "CANCELADA";
            reserva.fecha_cancelacion = DateTimeOffset.UtcNow;
            reserva.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateItemAsync(long id_evento, long id_regalo_item, RegalosListaUpdateItemDTO req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (id_evento <= 0) throw new Exception("id_evento inválido.");
            if (id_regalo_item <= 0) throw new Exception("id_regalo_item inválido.");
            if (string.IsNullOrWhiteSpace(req.titulo)) throw new Exception("El título es obligatorio.");
            if (req.cantidad_total <= 0) throw new Exception("cantidad_total inválida.");

            var item = await _context.ef_evento_regalos_lista_items
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.id_regalo_item == id_regalo_item);

            if (item == null) return false;

            item.titulo = req.titulo.Trim();
            item.descripcion = req.descripcion?.Trim();
            item.cantidad_total = req.cantidad_total;
            item.permitir_excedente = req.permitir_excedente;
            item.url_referencia = req.url_referencia?.Trim();
            item.imagen_url = req.imagen_url?.Trim();
            item.orden = req.orden;
            item.visible = req.visible;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RegalosListaItemDTO> DuplicarItemAsync(long id_evento, long id_regalo_item)
        {
            if (id_evento <= 0) throw new Exception("id_evento inválido.");
            if (id_regalo_item <= 0) throw new Exception("id_regalo_item inválido.");

            var original = await _context.ef_evento_regalos_lista_items
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == id_evento && x.id_regalo_item == id_regalo_item);

            if (original == null) throw new Exception("Item no encontrado.");

            // Orden al final
            short maxOrden = await _context.ef_evento_regalos_lista_items
                .Where(x => x.id_evento == id_evento)
                .Select(x => (short?)x.orden)
                .MaxAsync() ?? (short)0;

            var nuevo = new ef_evento_regalos_lista_items
            {
                id_evento = id_evento,
                titulo = original.titulo,
                descripcion = original.descripcion,
                cantidad_total = original.cantidad_total,
                permitir_excedente = original.permitir_excedente,
                url_referencia = original.url_referencia,
                imagen_url = original.imagen_url,
                orden = (short)(maxOrden + 1),
                visible = original.visible,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_regalos_lista_items.Add(nuevo);
            await _context.SaveChangesAsync();

            // DTO: tu RegalosListaItemDTO NO incluye permitir_excedente/url_referencia/imagen_url
            return new RegalosListaItemDTO
            {
                id_regalo_item = nuevo.id_regalo_item,
                id_evento = nuevo.id_evento,
                titulo = nuevo.titulo,
                descripcion = nuevo.descripcion,
                cantidad_total = nuevo.cantidad_total,

                // calculados (nuevo arranca en 0)
                cantidad_reservada = 0,
                cantidad_disponible = nuevo.cantidad_total,

                orden = nuevo.orden,
                visible = nuevo.visible,
                activo = nuevo.activo
            };
        }


    }
}