using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
