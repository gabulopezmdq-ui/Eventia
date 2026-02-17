using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace API.Services
{
    public class EventoPlantillasService : IEventoPlantillasService
    {
        private readonly DataContext _context;

        public EventoPlantillasService(DataContext context)
        {
            _context = context;
        }

        public async Task AplicarPlantillaAsync(
            long idEvento,
            short idPlantilla,
            DateTimeOffset fechaBase,
            string lugarBase = null,
            string direccionBase = null,
            decimal? latitudBase = null,
            decimal? longitudBase = null,
            bool borrarExistente = true)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();

            // Evento existe
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new InvalidOperationException("Evento inexistente.");

            // Plantilla existe
            var plantilla = await _context.Set<ef_plantillas_evento>()
                .SingleOrDefaultAsync(p => p.id_plantilla == idPlantilla && p.activo);

            if (plantilla == null)
                throw new InvalidOperationException("Plantilla inexistente o inactiva.");

            // Validación: coincide tipo de evento (si la plantilla lo tiene seteado)
            if (plantilla.id_tipo_evento != null)
            {
                var tipoPlantilla = Convert.ToInt32(plantilla.id_tipo_evento);
                var tipoEvento = Convert.ToInt32(ev.id_tipo_evento);

                if (tipoPlantilla != tipoEvento)
                    throw new InvalidOperationException("La plantilla no corresponde al tipo de evento del evento seleccionado.");
            }

            // Traer definiciones
            var tramosTpl = await _context.Set<ef_plantilla_tramos>()
                .Where(x => x.id_plantilla == idPlantilla && x.activo)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var accesosTpl = await _context.Set<ef_plantilla_accesos>()
                .Where(x => x.id_plantilla == idPlantilla && x.activo)
                .OrderBy(x => x.orden)
                .ToListAsync();

            if (tramosTpl.Count == 0) throw new InvalidOperationException("La plantilla no tiene tramos.");
            if (accesosTpl.Count == 0) throw new InvalidOperationException("La plantilla no tiene accesos.");

            var accesosTplIds = accesosTpl.Select(a => a.id_plantilla_acceso).ToList();

            var relTpl = await _context.Set<ef_plantilla_acceso_tramos>()
                .Where(r => accesosTplIds.Contains(r.id_plantilla_acceso))
                .ToListAsync();

            // Borrar existente
            if (borrarExistente)
            {
                var accesosExistentesIds = await _context.Set<ef_evento_accesos>()
                    .Where(a => a.id_evento == idEvento)
                    .Select(a => a.id_acceso)
                    .ToListAsync();

                if (accesosExistentesIds.Count > 0)
                {
                    _context.RemoveRange(
                        _context.Set<ef_evento_acceso_tramos>()
                            .Where(r => accesosExistentesIds.Contains(r.id_acceso))
                    );
                }

                _context.RemoveRange(_context.Set<ef_evento_accesos>().Where(a => a.id_evento == idEvento));
                _context.RemoveRange(_context.Set<ef_evento_tramos>().Where(t => t.id_evento == idEvento));

                ev.id_acceso_default = null;
                ev.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
            }

            // Crear tramos reales
            var mapTramos = new Dictionary<long, long>();

            foreach (var t in tramosTpl)
            {
                var tramoReal = new ef_evento_tramos
                {
                    id_evento = idEvento,
                    id_tramo_tipo = t.id_tramo_tipo,
                    nombre = t.nombre_default,
                    leyenda_visible = t.leyenda_default,
                    notas_internas = null,

                    fecha_hora_inicio = fechaBase, // NOT NULL
                    fecha_hora_fin = null,

                    lugar = lugarBase,
                    direccion = direccionBase,
                    latitud = latitudBase,
                    longitud = longitudBase,

                    orden = t.orden,
                    cupo = null,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_tramos>().Add(tramoReal);
                await _context.SaveChangesAsync();

                mapTramos[t.id_plantilla_tramo] = tramoReal.id_tramo;
            }

            // Crear accesos reales
            var mapAccesos = new Dictionary<long, long>();
            long? idAccesoDefault = null;

            foreach (var a in accesosTpl)
            {
                var accesoReal = new ef_evento_accesos
                {
                    id_evento = idEvento,
                    nombre = a.nombre_default,
                    mensaje_rsvp = a.mensaje_rsvp_default,
                    es_publico = a.es_publico_default,
                    cupo = null,
                    precio = null,
                    activo = true,
                    orden = a.orden,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_accesos>().Add(accesoReal);
                await _context.SaveChangesAsync();

                mapAccesos[a.id_plantilla_acceso] = accesoReal.id_acceso;

                if (a.es_default && idAccesoDefault == null)
                    idAccesoDefault = accesoReal.id_acceso;
            }

            if (idAccesoDefault == null)
                idAccesoDefault = mapAccesos.Values.FirstOrDefault();

            // Relaciones acceso->tramo
            var relsToAdd = new List<ef_evento_acceso_tramos>();

            foreach (var r in relTpl)
            {
                if (!mapAccesos.TryGetValue(r.id_plantilla_acceso, out var idAccesoReal)) continue;
                if (!mapTramos.TryGetValue(r.id_plantilla_tramo, out var idTramoReal)) continue;

                relsToAdd.Add(new ef_evento_acceso_tramos
                {
                    id_acceso = idAccesoReal,
                    id_tramo = idTramoReal
                });
            }

            _context.Set<ef_evento_acceso_tramos>().AddRange(relsToAdd);

            // Default en evento
            ev.id_acceso_default = idAccesoDefault;
            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task<EventoEstructuraDTO> GetEstructuraEventoAsync(long idEvento)
        {
            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null)
                throw new InvalidOperationException("Evento inexistente.");

            var tramos = await _context.Set<ef_evento_tramos>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderBy(x => x.orden)
                .Select(x => new TramoDTO
                {
                    id_tramo = x.id_tramo,
                    id_tramo_tipo = x.id_tramo_tipo,
                    nombre = x.nombre,
                    leyenda_visible = x.leyenda_visible,
                    notas_internas = x.notas_internas,
                    fecha_hora_inicio = x.fecha_hora_inicio,
                    fecha_hora_fin = x.fecha_hora_fin,
                    lugar = x.lugar,
                    direccion = x.direccion,
                    latitud = x.latitud,
                    longitud = x.longitud,
                    orden = x.orden,
                    cupo = x.cupo,
                    activo = x.activo
                })
                .ToListAsync();

            var accesos = await _context.Set<ef_evento_accesos>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderBy(x => x.orden)
                .Select(x => new AccesoDTO
                {
                    id_acceso = x.id_acceso,
                    nombre = x.nombre,
                    mensaje_rsvp = x.mensaje_rsvp,
                    es_publico = x.es_publico,
                    cupo = x.cupo,
                    precio = x.precio,
                    orden = x.orden,
                    activo = x.activo
                })
                .ToListAsync();

            var accesoIds = accesos.Select(a => a.id_acceso).ToList();

            var relaciones = await _context.Set<ef_evento_acceso_tramos>()
                .AsNoTracking()
                .Where(x => accesoIds.Contains(x.id_acceso))
                .Select(x => new RelacionAccesoTramoDTO
                {
                    id_acceso = x.id_acceso,
                    id_tramo = x.id_tramo
                })
                .ToListAsync();

            return new EventoEstructuraDTO
            {
                id_evento = idEvento,
                id_acceso_default = ev.id_acceso_default,
                tramos = tramos,
                accesos = accesos,
                relaciones = relaciones
            };
        }

        public async Task CrearEstructuraManualAsync(long idEvento, CrearEstructuraManualRequestDTO req, long? idUsuario = null)
        {
            // Validaciones mínimas (backend)
            if (req == null) throw new ArgumentNullException(nameof(req));
            if (req.fecha_base == default) throw new InvalidOperationException("fecha_base es obligatoria.");
            if (req.tramos == null || req.tramos.Count == 0) throw new InvalidOperationException("Debe informar al menos 1 tramo.");
            if (req.accesos == null || req.accesos.Count == 0) throw new InvalidOperationException("Debe informar al menos 1 acceso.");
            if (!req.accesos.Any(a => a.es_default)) throw new InvalidOperationException("Debe existir un acceso default.");
            if (req.accesos.Count(a => a.es_default) > 1) throw new InvalidOperationException("Solo puede existir un acceso default.");

            // ordenes únicos
            if (req.tramos.Select(t => t.orden).Distinct().Count() != req.tramos.Count)
                throw new InvalidOperationException("Los tramos tienen orden repetido.");
            if (req.accesos.Select(a => a.orden).Distinct().Count() != req.accesos.Count)
                throw new InvalidOperationException("Los accesos tienen orden repetido.");

            await using var tx = await _context.Database.BeginTransactionAsync();

            var ev = await _context.Set<ef_eventos>().SingleOrDefaultAsync(e => e.id_evento == idEvento);
            if (ev == null) throw new InvalidOperationException("Evento inexistente.");

            // borrar existente (igual que aplicar plantilla)
            if (req.borrar_existente)
            {
                var accesosExistentesIds = await _context.Set<ef_evento_accesos>()
                    .Where(a => a.id_evento == idEvento)
                    .Select(a => a.id_acceso)
                    .ToListAsync();

                if (accesosExistentesIds.Count > 0)
                {
                    _context.RemoveRange(
                        _context.Set<ef_evento_acceso_tramos>()
                            .Where(r => accesosExistentesIds.Contains(r.id_acceso))
                    );
                }

                _context.RemoveRange(_context.Set<ef_evento_accesos>().Where(a => a.id_evento == idEvento));
                _context.RemoveRange(_context.Set<ef_evento_tramos>().Where(t => t.id_evento == idEvento));

                ev.id_acceso_default = null;
                ev.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
            }

            // 1) Crear tramos reales y mapear por orden
            var mapTramoPorOrden = new Dictionary<short, long>();

            foreach (var t in req.tramos.OrderBy(x => x.orden))
            {
                if (string.IsNullOrWhiteSpace(t.nombre))
                    throw new InvalidOperationException("Cada tramo debe tener nombre.");

                var tramo = new ef_evento_tramos
                {
                    id_evento = idEvento,
                    id_tramo_tipo = t.id_tramo_tipo,
                    nombre = t.nombre.Trim(),
                    leyenda_visible = string.IsNullOrWhiteSpace(t.leyenda_visible) ? null : t.leyenda_visible.Trim(),
                    notas_internas = null,
                    fecha_hora_inicio = req.fecha_base, // NOT NULL
                    fecha_hora_fin = null,

                    // defaults base (editables luego por tramo)
                    lugar = req.lugar_base,
                    direccion = req.direccion_base,
                    latitud = req.latitud_base,
                    longitud = req.longitud_base,

                    orden = t.orden,
                    cupo = null,
                    activo = t.activo,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_tramos>().Add(tramo);
                await _context.SaveChangesAsync();

                mapTramoPorOrden[t.orden] = tramo.id_tramo;
            }

            // 2) Crear accesos reales y mapear por orden
            var mapAccesoPorOrden = new Dictionary<short, long>();
            long? idAccesoDefault = null;

            foreach (var a in req.accesos.OrderBy(x => x.orden))
            {
                if (string.IsNullOrWhiteSpace(a.nombre))
                    throw new InvalidOperationException("Cada acceso debe tener nombre.");

                var acceso = new ef_evento_accesos
                {
                    id_evento = idEvento,
                    nombre = a.nombre.Trim(),
                    mensaje_rsvp = string.IsNullOrWhiteSpace(a.mensaje_rsvp) ? null : a.mensaje_rsvp.Trim(),
                    es_publico = false, // por ahora fijo
                    cupo = null,
                    precio = null,
                    activo = a.activo,
                    orden = a.orden,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_accesos>().Add(acceso);
                await _context.SaveChangesAsync();

                mapAccesoPorOrden[a.orden] = acceso.id_acceso;

                if (a.es_default && idAccesoDefault == null)
                    idAccesoDefault = acceso.id_acceso;
            }

            if (idAccesoDefault == null)
                idAccesoDefault = mapAccesoPorOrden.Values.FirstOrDefault();

            // 3) Crear relaciones (checklist)
            // Validación: cada acceso tenga al menos 1 relación
            var relacionesPorAccesoOrden = req.relaciones
                .GroupBy(r => r.acceso_orden)
                .ToDictionary(g => g.Key, g => g.Select(x => x.tramo_orden).Distinct().ToList());

            foreach (var accesoOrden in mapAccesoPorOrden.Keys)
            {
                if (!relacionesPorAccesoOrden.ContainsKey(accesoOrden) || relacionesPorAccesoOrden[accesoOrden].Count == 0)
                    throw new InvalidOperationException($"El acceso orden {accesoOrden} no tiene tramos asignados.");
            }

            var relEntities = new List<ef_evento_acceso_tramos>();

            foreach (var r in req.relaciones)
            {
                if (!mapAccesoPorOrden.TryGetValue(r.acceso_orden, out var idAcceso))
                    throw new InvalidOperationException($"Relación inválida: acceso_orden {r.acceso_orden} no existe.");

                if (!mapTramoPorOrden.TryGetValue(r.tramo_orden, out var idTramo))
                    throw new InvalidOperationException($"Relación inválida: tramo_orden {r.tramo_orden} no existe.");

                relEntities.Add(new ef_evento_acceso_tramos
                {
                    id_acceso = idAcceso,
                    id_tramo = idTramo
                });
            }

            _context.Set<ef_evento_acceso_tramos>().AddRange(relEntities);

            // 4) Setear default
            ev.id_acceso_default = idAccesoDefault;
            ev.fecha_modif = DateTimeOffset.UtcNow;

            // 5) Registrar solicitud para admin (snapshot)
            if (req.registrar_solicitud)
            {
                // Serializamos el request entero como snapshot (jsonb)
                var payloadJson = JsonSerializer.Serialize(req, new JsonSerializerOptions { PropertyNamingPolicy = null });

                var solicitud = new ef_solicitudes_plantilla
                {
                    id_evento = idEvento,
                    id_tipo_evento = Convert.ToInt32(ev.id_tipo_evento),
                    id_plantilla_referida = req.id_plantilla_referida,
                    motivo = req.motivo,
                    detalle = req.detalle,
                    payload = payloadJson, // ver nota abajo
                    estado = "P",
                    id_usuario_solicita = idUsuario,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_revision = null,
                    id_usuario_revisa = null,
                    observaciones_admin = null
                };

                _context.Set<ef_solicitudes_plantilla>().Add(solicitud);
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task<long> ConvertirSolicitudEnPlantillaAsync(
    long idSolicitud,
    string codigo,
    long idUsuarioAdmin,
    string observacionesAdmin = null,
    bool activo = true)
        {
            if (string.IsNullOrWhiteSpace(codigo))
                throw new InvalidOperationException("codigo es obligatorio.");

            codigo = codigo.Trim().ToUpperInvariant();

            await using var tx = await _context.Database.BeginTransactionAsync();

            // 1) Buscar solicitud
            var sol = await _context.Set<ef_solicitudes_plantilla>()
                .SingleOrDefaultAsync(x => x.id_solicitud == idSolicitud);

            if (sol == null)
                throw new InvalidOperationException("Solicitud inexistente.");

            if (sol.estado != "P")
                throw new InvalidOperationException("Solo se pueden convertir solicitudes en estado Pendiente.");

            if (string.IsNullOrWhiteSpace(sol.payload))
                throw new InvalidOperationException("La solicitud no tiene payload.");

            // 2) Validar que no exista el codigo
            var existeCodigo = await _context.Set<ef_plantillas_evento>()
                .AnyAsync(p => p.codigo == codigo);

            if (existeCodigo)
                throw new InvalidOperationException("Ya existe una plantilla con ese código.");

            // 3) Deserializar payload (wizard)
            CrearEstructuraManualRequestDTO payload;
            try
            {
                payload = JsonSerializer.Deserialize<CrearEstructuraManualRequestDTO>(
                    sol.payload,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
            }
            catch
            {
                throw new InvalidOperationException("No se pudo deserializar el payload de la solicitud.");
            }

            if (payload == null)
                throw new InvalidOperationException("Payload inválido.");

            if (payload.tramos == null || payload.tramos.Count == 0)
                throw new InvalidOperationException("El payload no tiene tramos.");

            if (payload.accesos == null || payload.accesos.Count == 0)
                throw new InvalidOperationException("El payload no tiene accesos.");

            if (payload.relaciones == null || payload.relaciones.Count == 0)
                throw new InvalidOperationException("El payload no tiene relaciones.");

            // ordenes únicos (para mapear bien)
            if (payload.tramos.Select(t => t.orden).Distinct().Count() != payload.tramos.Count)
                throw new InvalidOperationException("El payload tiene tramos con orden repetido.");

            if (payload.accesos.Select(a => a.orden).Distinct().Count() != payload.accesos.Count)
                throw new InvalidOperationException("El payload tiene accesos con orden repetido.");

            // 4) Crear ef_plantillas_evento
            var plantilla = new ef_plantillas_evento
            {
                codigo = codigo,
                activo = activo,
                // OJO tipos: en tu tabla id_tipo_evento es int; si en entidad es short? convertí
                id_tipo_evento = Convert.ToInt32(sol.id_tipo_evento)
            };

            _context.Set<ef_plantillas_evento>().Add(plantilla);
            await _context.SaveChangesAsync();

            // 5) Crear plantilla_tramos y mapear por orden
            var mapTramoOrdenAId = new Dictionary<short, long>();

            foreach (var t in payload.tramos.OrderBy(x => x.orden))
            {
                if (string.IsNullOrWhiteSpace(t.nombre))
                    throw new InvalidOperationException("En payload hay un tramo sin nombre.");

                var pt = new ef_plantilla_tramos
                {
                    id_plantilla = plantilla.id_plantilla,
                    id_tramo_tipo = t.id_tramo_tipo,
                    nombre_default = t.nombre.Trim(),
                    leyenda_default = string.IsNullOrWhiteSpace(t.leyenda_visible) ? null : t.leyenda_visible.Trim(),
                    orden = t.orden,
                    activo = t.activo
                };

                _context.Set<ef_plantilla_tramos>().Add(pt);
                await _context.SaveChangesAsync();

                mapTramoOrdenAId[t.orden] = pt.id_plantilla_tramo;
            }

            // 6) Crear plantilla_accesos y mapear por orden
            var mapAccesoOrdenAId = new Dictionary<short, long>();

            foreach (var a in payload.accesos.OrderBy(x => x.orden))
            {
                if (string.IsNullOrWhiteSpace(a.nombre))
                    throw new InvalidOperationException("En payload hay un acceso sin nombre.");

                var pa = new ef_plantilla_accesos
                {
                    id_plantilla = plantilla.id_plantilla,
                    nombre_default = a.nombre.Trim(),
                    mensaje_rsvp_default = string.IsNullOrWhiteSpace(a.mensaje_rsvp) ? null : a.mensaje_rsvp.Trim(),
                    es_publico_default = false,  // por ahora fijo
                    orden = a.orden,
                    es_default = a.es_default,
                    activo = a.activo
                };

                _context.Set<ef_plantilla_accesos>().Add(pa);
                await _context.SaveChangesAsync();

                mapAccesoOrdenAId[a.orden] = pa.id_plantilla_acceso;
            }

            // Validar solo un default
            var defaults = payload.accesos.Count(x => x.es_default);
            if (defaults == 0) throw new InvalidOperationException("El payload no tiene acceso default.");
            if (defaults > 1) throw new InvalidOperationException("El payload tiene más de un acceso default.");

            // 7) Crear plantilla_acceso_tramos (relaciones) usando mapeo por orden
            var rels = new List<ef_plantilla_acceso_tramos>();

            foreach (var r in payload.relaciones)
            {
                if (!mapAccesoOrdenAId.TryGetValue(r.acceso_orden, out var idPlantillaAcceso))
                    throw new InvalidOperationException($"Relación inválida: acceso_orden {r.acceso_orden} no existe en payload.");

                if (!mapTramoOrdenAId.TryGetValue(r.tramo_orden, out var idPlantillaTramo))
                    throw new InvalidOperationException($"Relación inválida: tramo_orden {r.tramo_orden} no existe en payload.");

                rels.Add(new ef_plantilla_acceso_tramos
                {
                    id_plantilla_acceso = idPlantillaAcceso,
                    id_plantilla_tramo = idPlantillaTramo
                });
            }

            // Evitar duplicados por seguridad (por si payload trae repetidos)
            rels = rels
                .GroupBy(x => new { x.id_plantilla_acceso, x.id_plantilla_tramo })
                .Select(g => g.First())
                .ToList();

            _context.Set<ef_plantilla_acceso_tramos>().AddRange(rels);

            // 8) Marcar solicitud como aprobada
            sol.estado = "A";
            sol.fecha_revision = DateTimeOffset.UtcNow;
            sol.id_usuario_revisa = idUsuarioAdmin;
            sol.observaciones_admin = observacionesAdmin;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return plantilla.id_plantilla;
        }
    }
}
