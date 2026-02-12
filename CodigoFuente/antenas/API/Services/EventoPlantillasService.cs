using API.DataSchema;
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

        public async Task AplicarPlantillaAsync(long idEvento, short idPlantilla, bool borrarExistente = true)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();

            // 1) Evento
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new InvalidOperationException("Evento inexistente.");

            if (ev.fecha_hora == null)
                throw new InvalidOperationException("El evento debe tener fecha_hora para aplicar una plantilla.");

            // 2) Plantilla
            var plantilla = await _context.Set<ef_plantillas_evento>()
                .SingleOrDefaultAsync(p => p.id_plantilla == idPlantilla && p.activo);

            if (plantilla == null)
                throw new InvalidOperationException("Plantilla inexistente o inactiva.");

            // Validación recomendada: que coincida el tipo de evento (si está seteado)
            if (plantilla.id_tipo_evento != null)
            {
                var tipoEventoPlantilla = Convert.ToInt32(plantilla.id_tipo_evento);
                var tipoEventoEvento = Convert.ToInt32(ev.id_tipo_evento);

                if (tipoEventoPlantilla != tipoEventoEvento)
                    throw new InvalidOperationException("La plantilla no corresponde al tipo de evento del evento seleccionado.");
            }

            // 3) Traer definiciones de plantilla
            var tramosTpl = await _context.Set<ef_plantilla_tramos>()
                .Where(x => x.id_plantilla == idPlantilla && x.activo)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var accesosTpl = await _context.Set<ef_plantilla_accesos>()
                .Where(x => x.id_plantilla == idPlantilla && x.activo)
                .OrderBy(x => x.orden)
                .ToListAsync();

            if (tramosTpl.Count == 0)
                throw new InvalidOperationException("La plantilla no tiene tramos.");

            if (accesosTpl.Count == 0)
                throw new InvalidOperationException("La plantilla no tiene accesos.");

            var accesosTplIds = accesosTpl.Select(a => a.id_plantilla_acceso).ToList();

            var relTpl = await _context.Set<ef_plantilla_acceso_tramos>()
                .Where(r => accesosTplIds.Contains(r.id_plantilla_acceso))
                .ToListAsync();

            // 4) Borrar existente si corresponde (orden correcto)
            if (borrarExistente)
            {
                var accesosExistentesIds = await _context.Set<ef_evento_accesos>()
                    .Where(a => a.id_evento == idEvento)
                    .Select(a => a.id_acceso)
                    .ToListAsync();

                if (accesosExistentesIds.Count > 0)
                {
                    var relExistentes = _context.Set<ef_evento_acceso_tramos>()
                        .Where(r => accesosExistentesIds.Contains(r.id_acceso));
                    _context.RemoveRange(relExistentes);
                }

                var accesosExistentes = _context.Set<ef_evento_accesos>()
                    .Where(a => a.id_evento == idEvento);
                _context.RemoveRange(accesosExistentes);

                var tramosExistentes = _context.Set<ef_evento_tramos>()
                    .Where(t => t.id_evento == idEvento);
                _context.RemoveRange(tramosExistentes);

                ev.id_acceso_default = null;
                ev.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
            }

            // 5) Crear tramos reales y mapear id_plantilla_tramo -> id_tramo
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

                    // NOT NULL en tu tabla:
                    fecha_hora_inicio = ev.fecha_hora,
                    fecha_hora_fin = null,

                    lugar = ev.lugar,
                    direccion = ev.direccion,
                    latitud = ev.latitud,
                    longitud = ev.longitud,

                    orden = t.orden,
                    cupo = null,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = null
                };

                _context.Set<ef_evento_tramos>().Add(tramoReal);
                await _context.SaveChangesAsync();

                mapTramos[t.id_plantilla_tramo] = tramoReal.id_tramo; // PK real
            }

            // 6) Crear accesos reales y mapear id_plantilla_acceso -> id_acceso
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

            // 7) Crear relaciones reales evitando duplicados
            // (aunque la PK compuesta ya te protege, así evitamos excepciones si re-aplicás sin borrar)
            var relsToAdd = new List<ef_evento_acceso_tramos>();

            foreach (var r in relTpl)
            {
                if (!mapAccesos.TryGetValue(r.id_plantilla_acceso, out var idAccesoReal))
                    continue;

                if (!mapTramos.TryGetValue(r.id_plantilla_tramo, out var idTramoReal))
                    continue;

                relsToAdd.Add(new ef_evento_acceso_tramos
                {
                    id_acceso = idAccesoReal,
                    id_tramo = idTramoReal
                });
            }

            if (!borrarExistente && relsToAdd.Count > 0)
            {
                var accesoIds = relsToAdd.Select(x => x.id_acceso).Distinct().ToList();

                var existentes = await _context.Set<ef_evento_acceso_tramos>()
                    .Where(x => accesoIds.Contains(x.id_acceso))
                    .Select(x => new { x.id_acceso, x.id_tramo })
                    .ToListAsync();

                relsToAdd = relsToAdd
                    .Where(x => !existentes.Any(e => e.id_acceso == x.id_acceso && e.id_tramo == x.id_tramo))
                    .ToList();
            }

            _context.Set<ef_evento_acceso_tramos>().AddRange(relsToAdd);

            // 8) Setear default en evento
            ev.id_acceso_default = idAccesoDefault;
            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
    }
}
