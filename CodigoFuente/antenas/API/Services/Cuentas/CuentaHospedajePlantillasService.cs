using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class CuentaHospedajePlantillasService : ICuentaHospedajePlantillasService
    {
        private readonly DataContext _context;

        public CuentaHospedajePlantillasService(DataContext context)
        {
            _context = context;
        }

        // =========================
        // HELPERS SEGURIDAD
        // =========================

        private async Task<long> GetCuentaActivaDelUsuarioAsync(long idUsuario)
        {
            var q = from cu in _context.Set<ef_cuenta_usuarios>().AsNoTracking()
                    join c in _context.Set<ef_cuentas>().AsNoTracking() on cu.id_cuenta equals c.id_cuenta
                    where cu.id_usuario == idUsuario && cu.activo == true && c.estado == "A"
                    select c.id_cuenta;

            var idCuenta = await q.FirstOrDefaultAsync();
            if (idCuenta <= 0)
                throw new InvalidOperationException("El usuario no tiene una cuenta activa asociada.");

            return idCuenta;
        }

        private async Task ValidarPlantillaAsync(long idUsuario, long idPlantilla)
        {
            long idCuenta = await GetCuentaActivaDelUsuarioAsync(idUsuario);

            bool ok = await _context.Set<ef_cuenta_hospedaje_plantillas>()
                .AsNoTracking()
                .AnyAsync(x => x.id_hospedaje_plantilla == idPlantilla && x.id_cuenta == idCuenta);

            if (!ok) throw new UnauthorizedAccessException("No tenés acceso a esta plantilla.");
        }

        // =========================
        // PLANTILLAS
        // =========================

        public async Task<long> CrearOActualizarPlantillaAsync(long idUsuario, CuentaHospedajePlantillaUpsertRequestDTO req)
        {
            long idCuenta = await GetCuentaActivaDelUsuarioAsync(idUsuario);

            if (string.IsNullOrWhiteSpace(req.nombre))
                throw new InvalidOperationException("El nombre es obligatorio.");

            if (req.id_hospedaje_plantilla == null)
            {
                var nueva = new ef_cuenta_hospedaje_plantillas
                {
                    id_cuenta = idCuenta,
                    id_unidad = req.id_unidad,
                    codigo = req.codigo,
                    nombre = req.nombre.Trim(),
                    descripcion = req.descripcion,
                    ciudad = req.ciudad,
                    zona = req.zona,
                    id_pais = req.id_pais,
                    activo = req.activo,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Add(nueva);
                await _context.SaveChangesAsync();
                return nueva.id_hospedaje_plantilla;
            }
            else
            {
                long idPlantilla = req.id_hospedaje_plantilla.Value;

                var existente = await _context.Set<ef_cuenta_hospedaje_plantillas>()
                    .SingleOrDefaultAsync(x => x.id_hospedaje_plantilla == idPlantilla && x.id_cuenta == idCuenta);

                if (existente == null) throw new UnauthorizedAccessException("Plantilla inexistente o sin acceso.");

                existente.id_unidad = req.id_unidad;
                existente.codigo = req.codigo;
                existente.nombre = req.nombre.Trim();
                existente.descripcion = req.descripcion;
                existente.ciudad = req.ciudad;
                existente.zona = req.zona;
                existente.id_pais = req.id_pais;
                existente.activo = req.activo;
                existente.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
                return existente.id_hospedaje_plantilla;
            }
        }

        public async Task<List<CuentaHospedajePlantillaDTO>> MisPlantillasAsync(long idUsuario, bool soloActivas, long? idUnidad)
        {
            long idCuenta = await GetCuentaActivaDelUsuarioAsync(idUsuario);

            var q = _context.Set<ef_cuenta_hospedaje_plantillas>()
                .AsNoTracking()
                .Where(x => x.id_cuenta == idCuenta);

            if (soloActivas)
                q = q.Where(x => x.activo == true);

            if (idUnidad.HasValue)
                q = q.Where(x => x.id_unidad == idUnidad.Value);

            return await q
                .OrderBy(x => x.nombre)
                .Select(x => new CuentaHospedajePlantillaDTO
                {
                    id_hospedaje_plantilla = x.id_hospedaje_plantilla,
                    id_cuenta = x.id_cuenta,
                    id_unidad = x.id_unidad,
                    codigo = x.codigo,
                    nombre = x.nombre,
                    descripcion = x.descripcion,
                    ciudad = x.ciudad,
                    zona = x.zona,
                    id_pais = x.id_pais,
                    activo = x.activo
                })
                .ToListAsync();
        }

        public async Task<CuentaHospedajePlantillaDTO?> GetPlantillaAsync(long idUsuario, long idPlantilla)
        {
            await ValidarPlantillaAsync(idUsuario, idPlantilla);

            return await _context.Set<ef_cuenta_hospedaje_plantillas>()
                .AsNoTracking()
                .Where(x => x.id_hospedaje_plantilla == idPlantilla)
                .Select(x => new CuentaHospedajePlantillaDTO
                {
                    id_hospedaje_plantilla = x.id_hospedaje_plantilla,
                    id_cuenta = x.id_cuenta,
                    id_unidad = x.id_unidad,
                    codigo = x.codigo,
                    nombre = x.nombre,
                    descripcion = x.descripcion,
                    ciudad = x.ciudad,
                    zona = x.zona,
                    id_pais = x.id_pais,
                    activo = x.activo
                })
                .FirstOrDefaultAsync();
        }

        // =========================
        // ITEMS
        // =========================

        public async Task<List<CuentaHospedajePlantillaItemDTO>> GetItemsAsync(long idUsuario, long idPlantilla)
        {
            await ValidarPlantillaAsync(idUsuario, idPlantilla);

            return await _context.Set<ef_cuenta_hospedaje_plantilla_items>()
                .AsNoTracking()
                .Include(x => x.bloque)
                .Where(x => x.id_hospedaje_plantilla == idPlantilla)
                .OrderBy(x => x.orden)
                .Select(x => new CuentaHospedajePlantillaItemDTO
                {
                    id_hospedaje_plantilla_item = x.id_hospedaje_plantilla_item,
                    id_hospedaje_plantilla = x.id_hospedaje_plantilla,
                    nombre = x.nombre,
                    tipo = x.tipo,
                    zona = x.zona,
                    direccion = x.direccion,
                    url_externa = x.url_externa,
                    telefono = x.telefono,
                    whatsapp = x.whatsapp,
                    latitud = x.latitud,
                    longitud = x.longitud,
                    etiquetas = x.etiquetas,
                    nota_publica = x.nota_publica,
                    recomendado = x.recomendado,
                    orden = x.orden,
                    activo = x.activo,
                    bloque = x.bloque == null ? null : new CuentaHospedajePlantillaItemBloqueDTO
                    {
                        nombre_reserva = x.bloque.nombre_reserva,
                        codigo_promocional = x.bloque.codigo_promocional,
                        fecha_limite_reserva = x.bloque.fecha_limite_reserva,
                        condiciones = x.bloque.condiciones,
                        url_bloque = x.bloque.url_bloque,
                        activo = x.bloque.activo
                    }
                })
                .ToListAsync();
        }

        public async Task<long> UpsertItemAsync(long idUsuario, long idPlantilla, CuentaHospedajePlantillaItemUpsertRequestDTO req)
        {
            await ValidarPlantillaAsync(idUsuario, idPlantilla);

            if (string.IsNullOrWhiteSpace(req.nombre))
                throw new InvalidOperationException("El nombre es obligatorio.");

            // recomendado único por plantilla (evita choque con el índice unique parcial)
            if (req.recomendado)
            {
                var otros = await _context.Set<ef_cuenta_hospedaje_plantilla_items>()
                    .Where(x => x.id_hospedaje_plantilla == idPlantilla && x.activo == true && x.recomendado == true)
                    .ToListAsync();

                foreach (var o in otros)
                {
                    o.recomendado = false;
                    o.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            // normalizar etiquetas (códigos)
            var etiquetas = (req.etiquetas ?? Array.Empty<string>())
                .Select(x => (x ?? "").Trim().ToUpperInvariant())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToArray();

            if (req.id_hospedaje_plantilla_item == null)
            {
                var nuevo = new ef_cuenta_hospedaje_plantilla_items
                {
                    id_hospedaje_plantilla = idPlantilla,
                    nombre = req.nombre.Trim(),
                    tipo = req.tipo,
                    zona = req.zona,
                    direccion = req.direccion,
                    url_externa = req.url_externa,
                    telefono = req.telefono,
                    whatsapp = req.whatsapp,
                    latitud = req.latitud,
                    longitud = req.longitud,
                    etiquetas = etiquetas,
                    nota_publica = req.nota_publica,
                    recomendado = req.recomendado,
                    orden = req.orden,
                    activo = req.activo,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Add(nuevo);
                await _context.SaveChangesAsync();

                if (req.bloque != null)
                {
                    var b = new ef_cuenta_hospedaje_plantilla_item_bloques
                    {
                        id_hospedaje_plantilla_item = nuevo.id_hospedaje_plantilla_item,
                        nombre_reserva = req.bloque.nombre_reserva,
                        codigo_promocional = req.bloque.codigo_promocional,
                        fecha_limite_reserva = req.bloque.fecha_limite_reserva,
                        condiciones = req.bloque.condiciones,
                        url_bloque = req.bloque.url_bloque,
                        activo = req.bloque.activo,
                        fecha_alta = DateTimeOffset.UtcNow
                    };

                    _context.Add(b);
                    await _context.SaveChangesAsync();
                }

                return nuevo.id_hospedaje_plantilla_item;
            }
            else
            {
                long idItem = req.id_hospedaje_plantilla_item.Value;

                var item = await _context.Set<ef_cuenta_hospedaje_plantilla_items>()
                    .Include(x => x.bloque)
                    .SingleOrDefaultAsync(x => x.id_hospedaje_plantilla_item == idItem && x.id_hospedaje_plantilla == idPlantilla);

                if (item == null) throw new InvalidOperationException("Item inexistente.");

                item.nombre = req.nombre.Trim();
                item.tipo = req.tipo;
                item.zona = req.zona;
                item.direccion = req.direccion;
                item.url_externa = req.url_externa;
                item.telefono = req.telefono;
                item.whatsapp = req.whatsapp;
                item.latitud = req.latitud;
                item.longitud = req.longitud;
                item.etiquetas = etiquetas;
                item.nota_publica = req.nota_publica;
                item.recomendado = req.recomendado;
                item.orden = req.orden;
                item.activo = req.activo;
                item.fecha_modif = DateTimeOffset.UtcNow;

                if (req.bloque == null)
                {
                    if (item.bloque != null)
                        _context.Remove(item.bloque);
                }
                else
                {
                    if (item.bloque == null)
                    {
                        item.bloque = new ef_cuenta_hospedaje_plantilla_item_bloques
                        {
                            id_hospedaje_plantilla_item = item.id_hospedaje_plantilla_item,
                            fecha_alta = DateTimeOffset.UtcNow
                        };
                        _context.Add(item.bloque);
                    }

                    item.bloque.nombre_reserva = req.bloque.nombre_reserva;
                    item.bloque.codigo_promocional = req.bloque.codigo_promocional;
                    item.bloque.fecha_limite_reserva = req.bloque.fecha_limite_reserva;
                    item.bloque.condiciones = req.bloque.condiciones;
                    item.bloque.url_bloque = req.bloque.url_bloque;
                    item.bloque.activo = req.bloque.activo;
                    item.bloque.fecha_modif = DateTimeOffset.UtcNow;
                }

                await _context.SaveChangesAsync();
                return item.id_hospedaje_plantilla_item;
            }
        }

        public async Task<bool> DeleteItemAsync(long idUsuario, long idPlantilla, long idItem)
        {
            await ValidarPlantillaAsync(idUsuario, idPlantilla);

            var item = await _context.Set<ef_cuenta_hospedaje_plantilla_items>()
                .SingleOrDefaultAsync(x => x.id_hospedaje_plantilla_item == idItem && x.id_hospedaje_plantilla == idPlantilla);

            if (item == null) return false;

            _context.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // APLICAR A EVENTO
        // =========================

        public async Task<object> AplicarAEventoAsync(long idUsuario, long idPlantilla, CuentaHospedajePlantillaAplicarRequestDTO req)
        {
            await ValidarPlantillaAsync(idUsuario, idPlantilla);

            long idCuenta = await GetCuentaActivaDelUsuarioAsync(idUsuario);

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == req.id_evento && x.id_cuenta == idCuenta);

            if (ev == null)
                throw new UnauthorizedAccessException("El evento no pertenece a tu cuenta.");

            var items = await _context.Set<ef_cuenta_hospedaje_plantilla_items>()
                .AsNoTracking()
                .Include(x => x.bloque)
                .Where(x => x.id_hospedaje_plantilla == idPlantilla && x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            string modo = (req.modo ?? "REEMPLAZAR").Trim().ToUpperInvariant();
            if (modo != "REEMPLAZAR" && modo != "AGREGAR") modo = "REEMPLAZAR";

            if (modo == "REEMPLAZAR")
            {
                var actuales = await _context.Set<ef_evento_hospedajes>()
                    .Where(x => x.id_evento == req.id_evento)
                    .ToListAsync();

                if (actuales.Any())
                {
                    _context.RemoveRange(actuales);
                    await _context.SaveChangesAsync();
                }
            }

            HashSet<string> keysExistentes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (req.evitar_duplicados && modo == "AGREGAR")
            {
                var existentes = await _context.Set<ef_evento_hospedajes>()
                    .AsNoTracking()
                    .Where(x => x.id_evento == req.id_evento)
                    .Select(x => new { x.nombre, x.direccion })
                    .ToListAsync();

                foreach (var e in existentes)
                {
                    keysExistentes.Add((e.nombre ?? "") + "||" + (e.direccion ?? ""));
                }
            }

            int copiados = 0;

            foreach (var it in items)
            {
                string key = (it.nombre ?? "") + "||" + (it.direccion ?? "");
                if (req.evitar_duplicados && modo == "AGREGAR" && keysExistentes.Contains(key))
                    continue;

                var nuevo = new ef_evento_hospedajes
                {
                    id_evento = req.id_evento,
                    nombre = it.nombre,
                    tipo = it.tipo,
                    zona = it.zona,
                    direccion = it.direccion,
                    url_externa = it.url_externa,
                    telefono = it.telefono,
                    whatsapp = it.whatsapp,
                    latitud = it.latitud,
                    longitud = it.longitud,

                    id_tramo_referencia = null, // se define en el evento

                    precio_desde = null,
                    precio_hasta = null,
                    moneda = null,

                    etiquetas = it.etiquetas ?? Array.Empty<string>(),
                    nota_publica = it.nota_publica,
                    recomendado = it.recomendado,
                    orden = it.orden,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Add(nuevo);
                await _context.SaveChangesAsync();

                if (it.bloque != null && it.bloque.activo == true)
                {
                    var b = new ef_evento_hospedaje_bloques
                    {
                        id_hospedaje = nuevo.id_hospedaje,
                        nombre_reserva = it.bloque.nombre_reserva,
                        codigo_promocional = it.bloque.codigo_promocional,
                        fecha_limite_reserva = it.bloque.fecha_limite_reserva,
                        condiciones = it.bloque.condiciones,
                        url_bloque = it.bloque.url_bloque,
                        activo = true,
                        fecha_alta = DateTimeOffset.UtcNow
                    };

                    _context.Add(b);
                    await _context.SaveChangesAsync();
                }

                copiados++;
            }

            return new
            {
                ok = true,
                id_evento = req.id_evento,
                id_plantilla = idPlantilla,
                modo = modo,
                copiados = copiados
            };
        }
    }
}
