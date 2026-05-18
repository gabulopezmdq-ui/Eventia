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
            if (req.id_evento <= 0) throw new Exception("id_evento inválido.");
            if (req.id_regalo_item <= 0) throw new Exception("id_regalo_item inválido.");
            if (req.cantidad <= 0) throw new Exception("cantidad inválida.");

            // Sin vencimiento automático: no seteamos fecha_vencimiento jamás.
            using var tx = await _context.Database.BeginTransactionAsync();

            // lock del item para evitar carreras
            var item = await _context.ef_evento_regalos_lista_items
                .FromSqlInterpolated($@"
                    select * 
                    from public.ef_evento_regalos_lista_items
                    where id_regalo_item = {req.id_regalo_item} and id_evento = {req.id_evento}
                    for update")
                .FirstOrDefaultAsync();

            if (item == null || item.activo != true || item.visible != true)
                throw new Exception("Item no disponible.");

            int reservada = await _context.ef_evento_regalos_lista_reservas
                .Where(r => r.id_evento == req.id_evento
                            && r.id_regalo_item == req.id_regalo_item
                            && r.activo == true
                            && r.estado == "RESERVA_ACTIVA")
                .SumAsync(r => (int?)r.cantidad) ?? 0;

            int disponible = item.cantidad_total - reservada;

            if (!item.permitir_excedente && req.cantidad > disponible)
                throw new Exception("No hay disponibilidad para reservar ese regalo.");

            var reserva = new ef_evento_regalos_lista_reservas
            {
                id_evento = req.id_evento,
                id_regalo_item = req.id_regalo_item,

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
    }
}