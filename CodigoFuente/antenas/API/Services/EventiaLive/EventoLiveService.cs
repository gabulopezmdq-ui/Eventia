using API.DataSchema;
using API.DataSchema.DTO.EventiaLive;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.EventiaLive
{
    public class EventoLiveService : IEventoLiveService
    {
        private readonly DataContext _context;

        public EventoLiveService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<LiveDinamicaDTO>> GetByEventoAsync(long idEvento)
        {
            return await _context.ef_evento_live_dinamicas
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento && x.activo == true)
                .OrderByDescending(x => x.fecha_alta)
                .Select(x => new LiveDinamicaDTO
                {
                    id_dinamica = x.id_dinamica,
                    id_evento = x.id_evento,
                    codigo = x.codigo,
                    titulo = x.titulo,
                    descripcion = x.descripcion,
                    tipo_dinamica = x.tipo_dinamica,
                    estado = x.estado,
                    fecha_desde = x.fecha_desde,
                    fecha_hasta = x.fecha_hasta,
                    visible_portal = x.visible_portal,
                    requiere_checkin = x.requiere_checkin,
                    max_respuestas_por_invitado = x.max_respuestas_por_invitado,
                    permite_cambiar_respuesta = x.permite_cambiar_respuesta,
                    mostrar_resultados_publicos = x.mostrar_resultados_publicos,
                    modo_premio = x.modo_premio,
                    cantidad_ganadores = x.cantidad_ganadores,
                    opciones = _context.ef_evento_live_dinamica_opciones
                        .Where(o => o.id_dinamica == x.id_dinamica && o.activo == true)
                        .OrderBy(o => o.orden)
                        .Select(o => new LiveOpcionDTO
                        {
                            id_opcion = o.id_opcion,
                            texto = o.texto,
                            descripcion = o.descripcion,
                            imagen_url = o.imagen_url,
                            orden = o.orden,
                            es_correcta = o.es_correcta
                        })
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<long> CrearAsync(LiveCrearRequestDTO req)
        {
            if (req == null)
                throw new Exception("Request inválido.");

            if (req.id_evento <= 0)
                throw new Exception("Debe informar id_evento.");

            if (string.IsNullOrWhiteSpace(req.codigo))
                throw new Exception("Debe informar código.");

            if (string.IsNullOrWhiteSpace(req.titulo))
                throw new Exception("Debe informar título.");

            if (string.IsNullOrWhiteSpace(req.tipo_dinamica))
                throw new Exception("Debe informar tipo_dinamica.");

            string codigo = req.codigo.Trim().ToUpper();

            bool existe = await _context.ef_evento_live_dinamicas
                .AnyAsync(x => x.id_evento == req.id_evento && x.codigo == codigo);

            if (existe)
                throw new Exception("Ya existe una dinámica con ese código para el evento.");

            var dinamica = new ef_evento_live_dinamicas
            {
                id_evento = req.id_evento,
                codigo = codigo,
                titulo = req.titulo.Trim(),
                descripcion = req.descripcion,
                tipo_dinamica = req.tipo_dinamica.Trim().ToUpper(),
                estado = string.IsNullOrWhiteSpace(req.estado) ? "BORRADOR" : req.estado.Trim().ToUpper(),
                fecha_desde = req.fecha_desde,
                fecha_hasta = req.fecha_hasta,
                visible_portal = req.visible_portal,
                requiere_checkin = req.requiere_checkin,
                max_respuestas_por_invitado = req.max_respuestas_por_invitado <= 0 ? 1 : req.max_respuestas_por_invitado,
                permite_cambiar_respuesta = req.permite_cambiar_respuesta,
                mostrar_resultados_publicos = req.mostrar_resultados_publicos,
                modo_premio = string.IsNullOrWhiteSpace(req.modo_premio) ? "SIN_PREMIO" : req.modo_premio.Trim().ToUpper(),
                cantidad_ganadores = req.cantidad_ganadores,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_live_dinamicas.Add(dinamica);
            await _context.SaveChangesAsync();

            if (req.opciones != null && req.opciones.Count > 0)
            {
                int orden = 1;

                foreach (var op in req.opciones)
                {
                    if (string.IsNullOrWhiteSpace(op.texto))
                        continue;

                    _context.ef_evento_live_dinamica_opciones.Add(new ef_evento_live_dinamica_opciones
                    {
                        id_dinamica = dinamica.id_dinamica,
                        texto = op.texto.Trim(),
                        descripcion = op.descripcion,
                        imagen_url = op.imagen_url,
                        orden = op.orden <= 0 ? orden : op.orden,
                        es_correcta = op.es_correcta,
                        activo = true,
                        fecha_alta = DateTimeOffset.UtcNow
                    });

                    orden++;
                }

                await _context.SaveChangesAsync();
            }

            return dinamica.id_dinamica;
        }

        public async Task<string> CambiarEstadoAsync(long idDinamica, LiveCambiarEstadoRequestDTO req)
        {
            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == idDinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            if (req == null || string.IsNullOrWhiteSpace(req.estado))
                throw new Exception("Debe informar estado.");

            dinamica.estado = req.estado.Trim().ToUpper();
            dinamica.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return dinamica.estado;
        }

        public async Task<long> VotarAsync(LiveVotarRequestDTO req)
        {
            if (req == null)
                throw new Exception("Request inválido.");

            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == req.id_dinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            if (dinamica.estado != "ABIERTA")
                throw new Exception("La dinámica no está abierta.");

            if (req.id_opcion == null && string.IsNullOrWhiteSpace(req.respuesta_texto))
                throw new Exception("Debe informar opción o respuesta.");

            long? idInvitado = req.id_invitado;

            if (!idInvitado.HasValue && !string.IsNullOrWhiteSpace(req.token_consulta))
            {
                idInvitado = await _context.ef_invitados
                    .Where(i => i.rsvp_token == req.token_consulta)
                    .Select(i => (long?)i.id_invitado)
                    .FirstOrDefaultAsync();
            }

            var respuestasPrevias = await _context.ef_evento_live_respuestas
                .Where(x =>
                    x.id_dinamica == req.id_dinamica &&
                    x.activo == true &&
                    (
                        (idInvitado.HasValue && x.id_invitado == idInvitado.Value) ||
                        (!string.IsNullOrWhiteSpace(req.token_consulta) && x.token_consulta == req.token_consulta)
                    ))
                .ToListAsync();

            if (respuestasPrevias.Count >= dinamica.max_respuestas_por_invitado && !dinamica.permite_cambiar_respuesta)
                throw new Exception("Ya registraste tu respuesta.");

            if (dinamica.permite_cambiar_respuesta && respuestasPrevias.Count > 0)
            {
                foreach (var r in respuestasPrevias)
                {
                    r.activo = false;
                    r.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            var respuesta = new ef_evento_live_respuestas
            {
                id_dinamica = dinamica.id_dinamica,
                id_opcion = req.id_opcion,
                id_evento = dinamica.id_evento,
                id_invitado = idInvitado,
                token_consulta = req.token_consulta,
                respuesta_texto = req.respuesta_texto,
                activo = true,
                fecha_respuesta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_live_respuestas.Add(respuesta);
            await _context.SaveChangesAsync();

            return respuesta.id_respuesta;
        }

        public async Task<object> MarcarCorrectaYCalcularGanadoresAsync(LiveCalcularGanadoresRequestDTO req)
        {
            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == req.id_dinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            var opciones = await _context.ef_evento_live_dinamica_opciones
                .Where(x => x.id_dinamica == req.id_dinamica && x.activo == true)
                .ToListAsync();

            foreach (var op in opciones)
                op.es_correcta = op.id_opcion == req.id_opcion_correcta;

            var respuestas = await _context.ef_evento_live_respuestas
                .Where(x => x.id_dinamica == req.id_dinamica && x.activo == true)
                .OrderBy(x => x.fecha_respuesta)
                .ToListAsync();

            int ordenAcierto = 1;

            foreach (var r in respuestas)
            {
                r.es_correcta = r.id_opcion == req.id_opcion_correcta;

                if (r.es_correcta == true)
                {
                    r.orden_acierto = ordenAcierto;
                    ordenAcierto++;
                }
                else
                {
                    r.orden_acierto = null;
                }

                r.fecha_modif = DateTimeOffset.UtcNow;
            }

            dinamica.estado = "FINALIZADA";
            dinamica.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            var premio = await _context.ef_evento_live_premios
                .FirstOrDefaultAsync(x => x.id_dinamica == req.id_dinamica && x.activo == true);

            if (premio == null)
            {
                return new
                {
                    ok = true,
                    mensaje = "Se marcó la opción correcta. No hay premio configurado.",
                    ganadores = 0
                };
            }

            int cantidad = premio.cantidad_ganadores ?? dinamica.cantidad_ganadores ?? 0;

            var respuestasGanadoras = respuestas
                .Where(x => x.es_correcta == true)
                .OrderBy(x => x.fecha_respuesta)
                .Take(cantidad)
                .ToList();

            int orden = 1;

            foreach (var r in respuestasGanadoras)
            {
                bool yaExiste = await _context.ef_evento_live_ganadores
                    .AnyAsync(g => g.id_premio == premio.id_premio && g.id_respuesta == r.id_respuesta);

                if (yaExiste)
                    continue;

                _context.ef_evento_live_ganadores.Add(new ef_evento_live_ganadores
                {
                    id_premio = premio.id_premio,
                    id_dinamica = dinamica.id_dinamica,
                    id_respuesta = r.id_respuesta,
                    id_evento = dinamica.id_evento,
                    id_invitado = r.id_invitado,
                    token_consulta = r.token_consulta,
                    orden_ganador = orden,
                    estado = "PENDIENTE",
                    fecha_ganador = DateTimeOffset.UtcNow
                });

                orden++;
            }

            await _context.SaveChangesAsync();

            return new
            {
                ok = true,
                mensaje = "Ganadores calculados.",
                ganadores = respuestasGanadoras.Count
            };
        }
    }
}