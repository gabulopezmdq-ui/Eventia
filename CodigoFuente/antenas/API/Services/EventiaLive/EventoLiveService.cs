using API.DataSchema;
using API.DataSchema.DTO.EventiaLive;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace API.Services.EventiaLive
{
    public class EventoLiveService : IEventoLiveService
    {
        private readonly DataContext _context;

        private static readonly HashSet<string> EstadosValidos = new()
        {
            "BORRADOR",
            "PROGRAMADA",
            "ABIERTA",
            "CERRADA",
            "FINALIZADA",
            "ANULADA",
            "CANCELADA"
        };

        private static readonly HashSet<string> EstadosGanadorValidos = new()
        {
            "PENDIENTE",
            "NOTIFICADO",
            "ENTREGADO",
            "ANULADO",
            "CANCELADO"
        };

        public EventoLiveService(DataContext context)
        {
            _context = context;
        }

        public async Task<LiveByEventoResponseDTO> GetByEventoAsync(long idEvento)
        {
            var dinamicas = await _context.ef_evento_live_dinamicas
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

                    es_copia = x.es_copia,
                    id_dinamica_origen = x.id_dinamica_origen,

                    cantidad_votos = _context.ef_evento_live_respuestas
                        .Count(r =>
                            r.id_dinamica == x.id_dinamica &&
                            r.activo == true),

                    participantes_unicos = _context.ef_evento_live_respuestas
                        .Where(r =>
                            r.id_dinamica == x.id_dinamica &&
                            r.activo == true)
                        .Select(r => r.id_invitado.HasValue
                            ? "I_" + r.id_invitado.Value.ToString()
                            : "T_" + (r.token_consulta ?? ""))
                        .Distinct()
                        .Count(),

                    tiene_premio = _context.ef_evento_live_premios
                        .Any(p =>
                            p.id_dinamica == x.id_dinamica &&
                            p.activo == true),

                    premio_titulo = _context.ef_evento_live_premios
                        .Where(p =>
                            p.id_dinamica == x.id_dinamica &&
                            p.activo == true)
                        .OrderBy(p => p.id_premio)
                        .Select(p => p.titulo)
                        .FirstOrDefault(),

                    ganadores_generados = _context.ef_evento_live_ganadores
                        .Count(g => g.id_dinamica == x.id_dinamica),

                    premios_pendientes = _context.ef_evento_live_ganadores
                        .Count(g =>
                            g.id_dinamica == x.id_dinamica &&
                            g.estado == "PENDIENTE"),

                    premios_entregados = _context.ef_evento_live_ganadores
                        .Count(g =>
                            g.id_dinamica == x.id_dinamica &&
                            g.estado == "ENTREGADO"),

                    premios_cancelados = _context.ef_evento_live_ganadores
                        .Count(g =>
                            g.id_dinamica == x.id_dinamica &&
                            (g.estado == "CANCELADO" || g.estado == "ANULADO")),

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

            var resumen = new LiveResumenDTO
            {
                total = dinamicas.Count,
                borrador = dinamicas.Count(x => x.estado == "BORRADOR"),
                abiertas = dinamicas.Count(x => x.estado == "ABIERTA"),
                cerradas = dinamicas.Count(x => x.estado == "CERRADA"),
                finalizadas = dinamicas.Count(x => x.estado == "FINALIZADA"),
                anuladas = dinamicas.Count(x => x.estado == "ANULADA"),
                canceladas = dinamicas.Count(x => x.estado == "CANCELADA"),

                participaciones = dinamicas.Sum(x => x.cantidad_votos),
                participantes_unicos = dinamicas.Sum(x => x.participantes_unicos),

                ganadores = dinamicas.Sum(x => x.ganadores_generados),
                premios_pendientes = dinamicas.Sum(x => x.premios_pendientes),
                premios_entregados = dinamicas.Sum(x => x.premios_entregados),
                premios_cancelados = dinamicas.Sum(x => x.premios_cancelados)
            };

            return new LiveByEventoResponseDTO
            {
                id_evento = idEvento,
                resumen = resumen,
                dinamicas = dinamicas
            };
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
            string estado = string.IsNullOrWhiteSpace(req.estado) ? "BORRADOR" : req.estado.Trim().ToUpper();

            ValidarEstado(estado);

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
                estado = estado,
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

            await UpsertOpcionesAsync(dinamica.id_dinamica, req.opciones);

            return dinamica.id_dinamica;
        }

        public async Task EditarAsync(long idDinamica, LiveEditarRequestDTO req)
        {
            if (req == null)
                throw new Exception("Request inválido.");

            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == idDinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            bool tieneRespuestas = await _context.ef_evento_live_respuestas
                .AnyAsync(x => x.id_dinamica == idDinamica && x.activo == true);

            if (!string.IsNullOrWhiteSpace(req.codigo))
            {
                string codigo = req.codigo.Trim().ToUpper();

                bool existeCodigo = await _context.ef_evento_live_dinamicas
                    .AnyAsync(x =>
                        x.id_evento == dinamica.id_evento &&
                        x.codigo == codigo &&
                        x.id_dinamica != idDinamica);

                if (existeCodigo)
                    throw new Exception("Ya existe otra dinámica con ese código para el evento.");

                dinamica.codigo = codigo;
            }

            if (!string.IsNullOrWhiteSpace(req.titulo))
                dinamica.titulo = req.titulo.Trim();

            if (req.descripcion != null)
                dinamica.descripcion = req.descripcion;

            if (!string.IsNullOrWhiteSpace(req.tipo_dinamica))
                dinamica.tipo_dinamica = req.tipo_dinamica.Trim().ToUpper();

            if (!string.IsNullOrWhiteSpace(req.estado))
            {
                string estado = req.estado.Trim().ToUpper();
                ValidarEstado(estado);
                dinamica.estado = estado;
            }

            dinamica.fecha_desde = req.fecha_desde;
            dinamica.fecha_hasta = req.fecha_hasta;

            if (req.visible_portal.HasValue)
                dinamica.visible_portal = req.visible_portal.Value;

            if (req.requiere_checkin.HasValue)
                dinamica.requiere_checkin = req.requiere_checkin.Value;

            if (req.max_respuestas_por_invitado.HasValue)
            {
                if (req.max_respuestas_por_invitado.Value <= 0)
                    throw new Exception("max_respuestas_por_invitado debe ser mayor a 0.");

                dinamica.max_respuestas_por_invitado = req.max_respuestas_por_invitado.Value;
            }

            if (req.permite_cambiar_respuesta.HasValue)
                dinamica.permite_cambiar_respuesta = req.permite_cambiar_respuesta.Value;

            if (req.mostrar_resultados_publicos.HasValue)
                dinamica.mostrar_resultados_publicos = req.mostrar_resultados_publicos.Value;

            if (!string.IsNullOrWhiteSpace(req.modo_premio))
                dinamica.modo_premio = req.modo_premio.Trim().ToUpper();

            if (req.cantidad_ganadores.HasValue)
                dinamica.cantidad_ganadores = req.cantidad_ganadores;

            dinamica.fecha_modif = DateTimeOffset.UtcNow;

            if (req.opciones != null)
            {
                if (tieneRespuestas)
                    throw new Exception("No se pueden reemplazar opciones porque la dinámica ya tiene respuestas.");

                await UpsertOpcionesAsync(idDinamica, req.opciones, reemplazar: true);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<string> CambiarEstadoAsync(long idDinamica, LiveCambiarEstadoRequestDTO req)
        {
            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == idDinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            if (req == null || string.IsNullOrWhiteSpace(req.estado))
                throw new Exception("Debe informar estado.");

            string estado = req.estado.Trim().ToUpper();

            ValidarEstado(estado);

            dinamica.estado = estado;
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

            var now = DateTimeOffset.UtcNow;

            if (dinamica.fecha_desde.HasValue && dinamica.fecha_desde.Value > now)
                throw new Exception("La dinámica todavía no está habilitada.");

            if (dinamica.fecha_hasta.HasValue && dinamica.fecha_hasta.Value < now)
                throw new Exception("La dinámica ya finalizó.");

            if (req.id_opcion == null && string.IsNullOrWhiteSpace(req.respuesta_texto))
                throw new Exception("Debe informar opción o respuesta.");

            if (req.id_opcion.HasValue)
            {
                bool opcionValida = await _context.ef_evento_live_dinamica_opciones
                    .AnyAsync(x =>
                        x.id_dinamica == dinamica.id_dinamica &&
                        x.id_opcion == req.id_opcion.Value &&
                        x.activo == true);

                if (!opcionValida)
                    throw new Exception("Opción inválida para la dinámica.");
            }

            long? idInvitado = req.id_invitado;

            if (!idInvitado.HasValue && !string.IsNullOrWhiteSpace(req.token_consulta))
            {
                idInvitado = await _context.ef_invitados
                    .Where(i =>
                        i.activo == true &&
                        i.rsvp_token == req.token_consulta)
                    .Select(i => (long?)i.id_invitado)
                    .FirstOrDefaultAsync();
            }

            if (!idInvitado.HasValue && string.IsNullOrWhiteSpace(req.token_consulta))
                throw new Exception("Debe informar token_consulta o id_invitado.");

            if (dinamica.requiere_checkin)
                await ValidarCheckinAsync(dinamica.id_evento, idInvitado, req.token_consulta);

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
            if (req == null)
                throw new Exception("Request inválido.");

            var dinamica = await _context.ef_evento_live_dinamicas
                .FirstOrDefaultAsync(x => x.id_dinamica == req.id_dinamica && x.activo == true);

            if (dinamica == null)
                throw new Exception("Dinámica no encontrada.");

            var opcionCorrecta = await _context.ef_evento_live_dinamica_opciones
                .FirstOrDefaultAsync(x =>
                    x.id_dinamica == req.id_dinamica &&
                    x.id_opcion == req.id_opcion_correcta &&
                    x.activo == true);

            if (opcionCorrecta == null)
                throw new Exception("Opción correcta inválida.");

            var opciones = await _context.ef_evento_live_dinamica_opciones
                .Where(x => x.id_dinamica == req.id_dinamica && x.activo == true)
                .ToListAsync();

            foreach (var op in opciones)
            {
                op.es_correcta = op.id_opcion == req.id_opcion_correcta;
                op.fecha_modif = DateTimeOffset.UtcNow;
            }

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

            var premios = await _context.ef_evento_live_premios
                .Where(x => x.id_dinamica == req.id_dinamica && x.activo == true)
                .ToListAsync();

            if (premios.Count == 0)
            {
                return new
                {
                    ok = true,
                    mensaje = "Se marcó la opción correcta. No hay premios configurados.",
                    ganadores = 0
                };
            }

            int totalGanadores = 0;

            foreach (var premio in premios)
            {
                int cantidad = premio.cantidad_ganadores ?? dinamica.cantidad_ganadores ?? 0;

                if (premio.modo_premio == "SIN_PREMIO")
                    continue;

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
                        qr_token_premio = GenerarQrTokenPremio(),
                        fecha_generacion_qr = DateTimeOffset.UtcNow,
                        fecha_ganador = DateTimeOffset.UtcNow
                    });

                    totalGanadores++;
                    orden++;
                }
            }

            await _context.SaveChangesAsync();

            return new
            {
                ok = true,
                mensaje = "Ganadores calculados.",
                ganadores = totalGanadores
            };
        }

        public async Task<List<LiveGanadorDTO>> GetGanadoresAsync(long idDinamica)
        {
            return await (
                from g in _context.ef_evento_live_ganadores.AsNoTracking()
                join r in _context.ef_evento_live_respuestas.AsNoTracking()
                    on g.id_respuesta equals r.id_respuesta into rg
                from r in rg.DefaultIfEmpty()
                join o in _context.ef_evento_live_dinamica_opciones.AsNoTracking()
                    on r.id_opcion equals o.id_opcion into og
                from o in og.DefaultIfEmpty()
                join i in _context.ef_invitados.AsNoTracking()
                    on g.id_invitado equals i.id_invitado into ig
                from i in ig.DefaultIfEmpty()
                where g.id_dinamica == idDinamica
                orderby g.orden_ganador, g.fecha_ganador
                select new LiveGanadorDTO
                {
                    id_ganador = g.id_ganador,
                    id_premio = g.id_premio,
                    id_dinamica = g.id_dinamica,
                    id_respuesta = g.id_respuesta,
                    id_evento = g.id_evento,
                    id_invitado = g.id_invitado,
                    token_consulta = g.token_consulta,
                    qr_token_premio = g.qr_token_premio,
                    fecha_generacion_qr = g.fecha_generacion_qr,
                    entregado_por_usuario = g.entregado_por_usuario,
                    orden_ganador = g.orden_ganador,
                    estado = g.estado,
                    observaciones = g.observaciones,
                    fecha_ganador = g.fecha_ganador,
                    fecha_entrega = g.fecha_entrega,
                    invitado_nombre = i == null ? null : ((i.nombre ?? "") + " " + (i.apellido ?? "")).Trim(),
                    invitado_email = i == null ? null : i.email,
                    opcion_texto = o == null ? null : o.texto,
                    fecha_respuesta = r == null ? null : r.fecha_respuesta
                }
            ).ToListAsync();
        }

        public async Task CambiarEstadoGanadorAsync(long idGanador, LiveGanadorEstadoRequestDTO req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.estado))
                throw new Exception("Debe informar estado.");

            string estado = req.estado.Trim().ToUpper();

            if (!EstadosGanadorValidos.Contains(estado))
                throw new Exception("Estado de ganador inválido.");

            var ganador = await _context.ef_evento_live_ganadores
                .FirstOrDefaultAsync(x => x.id_ganador == idGanador);

            if (ganador == null)
                throw new Exception("Ganador no encontrado.");

            ganador.estado = estado;
            ganador.observaciones = req.observaciones;
            ganador.fecha_modif = DateTimeOffset.UtcNow;

            if (estado == "ENTREGADO")
            {
                ganador.fecha_entrega = DateTimeOffset.UtcNow;
                ganador.entregado_por_usuario = req.entregado_por_usuario;
            }

            await _context.SaveChangesAsync();
        }

        private async Task UpsertOpcionesAsync(
            long idDinamica,
            List<LiveCrearOpcionRequestDTO>? opciones,
            bool reemplazar = false)
        {
            if (opciones == null)
                return;

            if (reemplazar)
            {
                var actuales = await _context.ef_evento_live_dinamica_opciones
                    .Where(x => x.id_dinamica == idDinamica)
                    .ToListAsync();

                foreach (var actual in actuales)
                {
                    actual.activo = false;
                    actual.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            int ordenAuto = 1;

            foreach (var op in opciones)
            {
                if (string.IsNullOrWhiteSpace(op.texto))
                    continue;

                if (op.id_opcion.HasValue && !reemplazar)
                {
                    var existente = await _context.ef_evento_live_dinamica_opciones
                        .FirstOrDefaultAsync(x =>
                            x.id_dinamica == idDinamica &&
                            x.id_opcion == op.id_opcion.Value);

                    if (existente != null)
                    {
                        existente.texto = op.texto.Trim();
                        existente.descripcion = op.descripcion;
                        existente.imagen_url = op.imagen_url;
                        existente.orden = op.orden <= 0 ? ordenAuto : op.orden;
                        existente.es_correcta = op.es_correcta;
                        existente.activo = op.activo;
                        existente.fecha_modif = DateTimeOffset.UtcNow;

                        ordenAuto++;
                        continue;
                    }
                }

                _context.ef_evento_live_dinamica_opciones.Add(new ef_evento_live_dinamica_opciones
                {
                    id_dinamica = idDinamica,
                    texto = op.texto.Trim(),
                    descripcion = op.descripcion,
                    imagen_url = op.imagen_url,
                    orden = op.orden <= 0 ? ordenAuto : op.orden,
                    es_correcta = op.es_correcta,
                    activo = op.activo,
                    fecha_alta = DateTimeOffset.UtcNow
                });

                ordenAuto++;
            }

            await _context.SaveChangesAsync();
        }

        private void ValidarEstado(string estado)
        {
            if (!EstadosValidos.Contains(estado))
                throw new Exception("Estado inválido.");
        }

        private async Task ValidarCheckinAsync(long idEvento, long? idInvitado, string? tokenConsulta)
        {
            long? invitado = idInvitado;

            if (!invitado.HasValue && !string.IsNullOrWhiteSpace(tokenConsulta))
            {
                invitado = await _context.ef_invitados
                    .AsNoTracking()
                    .Where(x =>
                        x.id_evento == idEvento &&
                        x.activo == true &&
                        x.rsvp_token == tokenConsulta)
                    .Select(x => (long?)x.id_invitado)
                    .FirstOrDefaultAsync();
            }

            if (!invitado.HasValue)
                throw new Exception("No se pudo identificar al invitado para validar check-in.");

            bool hizoCheckin = await _context.ef_evento_checkins
                .AsNoTracking()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_invitado == invitado.Value);

            if (!hizoCheckin)
                throw new Exception("Para participar necesitás haber realizado check-in.");
        }

        public async Task<List<LivePremioDTO>> GetPremiosAsync(long idDinamica)
        {
            return await _context.ef_evento_live_premios
                .AsNoTracking()
                .Where(x => x.id_dinamica == idDinamica)
                .OrderByDescending(x => x.activo)
                .ThenBy(x => x.id_premio)
                .Select(x => new LivePremioDTO
                {
                    id_premio = x.id_premio,
                    id_dinamica = x.id_dinamica,
                    titulo = x.titulo,
                    descripcion = x.descripcion,
                    modo_premio = x.modo_premio,
                    cantidad_ganadores = x.cantidad_ganadores,
                    instrucciones_entrega = x.instrucciones_entrega,
                    sponsor_nombre = x.sponsor_nombre,
                    activo = x.activo
                })
                .ToListAsync();
        }

        public async Task<long> UpsertPremioAsync(LivePremioUpsertRequestDTO req)
        {
            if (req == null)
                throw new Exception("Request inválido.");

            if (req.id_dinamica <= 0)
                throw new Exception("Debe informar id_dinamica.");

            if (string.IsNullOrWhiteSpace(req.titulo))
                throw new Exception("Debe informar título del premio.");

            if (string.IsNullOrWhiteSpace(req.modo_premio))
                throw new Exception("Debe informar modo_premio.");

            var dinamicaExiste = await _context.ef_evento_live_dinamicas
                .AnyAsync(x => x.id_dinamica == req.id_dinamica && x.activo == true);

            if (!dinamicaExiste)
                throw new Exception("Dinámica no encontrada.");

            string modoPremio = req.modo_premio.Trim().ToUpper();

            ef_evento_live_premios? premio = null;

            if (req.id_premio.HasValue && req.id_premio.Value > 0)
            {
                premio = await _context.ef_evento_live_premios
                    .FirstOrDefaultAsync(x =>
                        x.id_premio == req.id_premio.Value &&
                        x.id_dinamica == req.id_dinamica);

                if (premio == null)
                    throw new Exception("Premio no encontrado.");
            }

            if (premio == null)
            {
                premio = new ef_evento_live_premios
                {
                    id_dinamica = req.id_dinamica,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.ef_evento_live_premios.Add(premio);
            }

            premio.titulo = req.titulo.Trim();
            premio.descripcion = req.descripcion;
            premio.modo_premio = modoPremio;
            premio.cantidad_ganadores = req.cantidad_ganadores;
            premio.instrucciones_entrega = req.instrucciones_entrega;
            premio.sponsor_nombre = req.sponsor_nombre;
            premio.activo = req.activo;
            premio.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return premio.id_premio;
        }


        public async Task<LiveCanjearPremioResponseDTO> CanjearPremioAsync(LiveCanjearPremioRequestDTO req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.qr_token_premio))
                throw new Exception("Debe informar qr_token_premio.");

            string token = req.qr_token_premio.Trim();

            var ganador = await _context.ef_evento_live_ganadores
                .FirstOrDefaultAsync(x => x.qr_token_premio == token);

            if (ganador == null)
            {
                return new LiveCanjearPremioResponseDTO
                {
                    ok = false,
                    estado = "NO_ENCONTRADO",
                    mensaje = "QR de premio inválido."
                };
            }

            var premio = await _context.ef_evento_live_premios
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_premio == ganador.id_premio);

            string? invitadoNombre = null;

            if (ganador.id_invitado.HasValue)
            {
                var invitado = await _context.ef_invitados
                    .AsNoTracking()
                    .Where(x => x.id_invitado == ganador.id_invitado.Value)
                    .Select(x => new
                    {
                        x.nombre,
                        x.apellido
                    })
                    .FirstOrDefaultAsync();

                if (invitado != null)
                    invitadoNombre = $"{invitado.nombre} {invitado.apellido}".Trim();
            }

            if (ganador.estado == "ENTREGADO")
            {
                return new LiveCanjearPremioResponseDTO
                {
                    ok = false,
                    estado = "YA_ENTREGADO",
                    mensaje = "Este premio ya fue entregado.",
                    id_ganador = ganador.id_ganador,
                    id_evento = ganador.id_evento,
                    id_dinamica = ganador.id_dinamica,
                    id_invitado = ganador.id_invitado,
                    premio = premio?.titulo,
                    invitado_nombre = invitadoNombre,
                    fecha_entrega = ganador.fecha_entrega
                };
            }

            if (ganador.estado == "ANULADO" || ganador.estado == "CANCELADO")
            {
                return new LiveCanjearPremioResponseDTO
                {
                    ok = false,
                    estado = ganador.estado,
                    mensaje = "Este premio no está disponible para entrega.",
                    id_ganador = ganador.id_ganador,
                    id_evento = ganador.id_evento,
                    id_dinamica = ganador.id_dinamica,
                    id_invitado = ganador.id_invitado,
                    premio = premio?.titulo,
                    invitado_nombre = invitadoNombre
                };
            }

            ganador.estado = "ENTREGADO";
            ganador.fecha_entrega = DateTimeOffset.UtcNow;
            ganador.entregado_por_usuario = req.entregado_por_usuario;
            ganador.observaciones = req.observaciones;
            ganador.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new LiveCanjearPremioResponseDTO
            {
                ok = true,
                estado = "ENTREGADO",
                mensaje = "Premio entregado correctamente.",
                id_ganador = ganador.id_ganador,
                id_evento = ganador.id_evento,
                id_dinamica = ganador.id_dinamica,
                id_invitado = ganador.id_invitado,
                premio = premio?.titulo,
                invitado_nombre = invitadoNombre,
                fecha_entrega = ganador.fecha_entrega
            };
        }

        private string GenerarQrTokenPremio()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToHexString(bytes).ToLower();
        }

        public async Task<LivePremioPorQrResponseDTO> GetPremioPorQrAsync(string qrToken)
        {
            if (string.IsNullOrWhiteSpace(qrToken))
                throw new Exception("Debe informar qrToken.");

            string token = qrToken.Trim();

            var data = await (
                from g in _context.ef_evento_live_ganadores.AsNoTracking()
                join p in _context.ef_evento_live_premios.AsNoTracking()
                    on g.id_premio equals p.id_premio
                join i0 in _context.ef_invitados.AsNoTracking()
                    on g.id_invitado equals i0.id_invitado into gi
                from i in gi.DefaultIfEmpty()
                where g.qr_token_premio == token
                select new
                {
                    g.id_ganador,
                    g.id_evento,
                    g.id_dinamica,
                    g.id_invitado,
                    g.estado,
                    g.fecha_ganador,
                    g.fecha_entrega,
                    premio = p.titulo,
                    premio_descripcion = p.descripcion,
                    p.sponsor_nombre,
                    invitado_nombre = i == null ? null : ((i.nombre ?? "") + " " + (i.apellido ?? "")).Trim(),
                    invitado_email = i == null ? null : i.email
                }
            ).FirstOrDefaultAsync();

            if (data == null)
            {
                return new LivePremioPorQrResponseDTO
                {
                    ok = false,
                    estado = "NO_ENCONTRADO",
                    mensaje = "QR de premio inválido."
                };
            }

            if (data.estado == "ENTREGADO")
            {
                return new LivePremioPorQrResponseDTO
                {
                    ok = false,
                    estado = "YA_ENTREGADO",
                    mensaje = "Este premio ya fue entregado.",
                    id_ganador = data.id_ganador,
                    id_evento = data.id_evento,
                    id_dinamica = data.id_dinamica,
                    id_invitado = data.id_invitado,
                    premio = data.premio,
                    premio_descripcion = data.premio_descripcion,
                    sponsor_nombre = data.sponsor_nombre,
                    invitado_nombre = data.invitado_nombre,
                    invitado_email = data.invitado_email,
                    fecha_ganador = data.fecha_ganador,
                    fecha_entrega = data.fecha_entrega
                };
            }

            if (data.estado == "ANULADO" || data.estado == "CANCELADO")
            {
                return new LivePremioPorQrResponseDTO
                {
                    ok = false,
                    estado = data.estado,
                    mensaje = "Este premio no está disponible para entrega.",
                    id_ganador = data.id_ganador,
                    id_evento = data.id_evento,
                    id_dinamica = data.id_dinamica,
                    id_invitado = data.id_invitado,
                    premio = data.premio,
                    premio_descripcion = data.premio_descripcion,
                    sponsor_nombre = data.sponsor_nombre,
                    invitado_nombre = data.invitado_nombre,
                    invitado_email = data.invitado_email,
                    fecha_ganador = data.fecha_ganador,
                    fecha_entrega = data.fecha_entrega
                };
            }

            return new LivePremioPorQrResponseDTO
            {
                ok = true,
                estado = data.estado,
                mensaje = "Premio válido para entrega.",
                id_ganador = data.id_ganador,
                id_evento = data.id_evento,
                id_dinamica = data.id_dinamica,
                id_invitado = data.id_invitado,
                premio = data.premio,
                premio_descripcion = data.premio_descripcion,
                sponsor_nombre = data.sponsor_nombre,
                invitado_nombre = data.invitado_nombre,
                invitado_email = data.invitado_email,
                fecha_ganador = data.fecha_ganador,
                fecha_entrega = data.fecha_entrega
            };
        }

        public async Task<long> DuplicarAsync(LiveDuplicarRequestDTO req)
        {
            if (req == null || req.id_dinamica <= 0)
                throw new Exception("Debe informar id_dinamica.");

            var origen = await _context.ef_evento_live_dinamicas
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.id_dinamica == req.id_dinamica &&
                    x.activo == true);

            if (origen == null)
                throw new Exception("Dinámica origen no encontrada.");

            var opcionesOrigen = await _context.ef_evento_live_dinamica_opciones
                .AsNoTracking()
                .Where(x =>
                    x.id_dinamica == origen.id_dinamica &&
                    x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var premiosOrigen = await _context.ef_evento_live_premios
                .AsNoTracking()
                .Where(x =>
                    x.id_dinamica == origen.id_dinamica &&
                    x.activo == true)
                .OrderBy(x => x.id_premio)
                .ToListAsync();

            string codigoBase = origen.codigo + "_COPIA";
            string codigoNuevo = codigoBase;
            int contador = 1;

            while (await _context.ef_evento_live_dinamicas
                .AnyAsync(x => x.id_evento == origen.id_evento && x.codigo == codigoNuevo))
            {
                contador++;
                codigoNuevo = $"{codigoBase}_{contador}";
            }

            var nueva = new ef_evento_live_dinamicas
            {
                id_evento = origen.id_evento,
                codigo = codigoNuevo,
                titulo = origen.titulo + " (copia)",
                descripcion = origen.descripcion,
                tipo_dinamica = origen.tipo_dinamica,
                es_copia = true,
                id_dinamica_origen = origen.id_dinamica,
                estado = "BORRADOR",
                fecha_desde = null,
                fecha_hasta = null,
                visible_portal = false,
                requiere_checkin = origen.requiere_checkin,
                max_respuestas_por_invitado = origen.max_respuestas_por_invitado,
                permite_cambiar_respuesta = origen.permite_cambiar_respuesta,
                mostrar_resultados_publicos = origen.mostrar_resultados_publicos,
                modo_premio = origen.modo_premio,
                cantidad_ganadores = origen.cantidad_ganadores,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_live_dinamicas.Add(nueva);
            await _context.SaveChangesAsync();

            foreach (var op in opcionesOrigen)
            {
                _context.ef_evento_live_dinamica_opciones.Add(new ef_evento_live_dinamica_opciones
                {
                    id_dinamica = nueva.id_dinamica,
                    texto = op.texto,
                    descripcion = op.descripcion,
                    imagen_url = op.imagen_url,
                    orden = op.orden,
                    es_correcta = false,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }

            foreach (var premio in premiosOrigen)
            {
                _context.ef_evento_live_premios.Add(new ef_evento_live_premios
                {
                    id_dinamica = nueva.id_dinamica,
                    titulo = premio.titulo,
                    descripcion = premio.descripcion,
                    modo_premio = premio.modo_premio,
                    cantidad_ganadores = premio.cantidad_ganadores,
                    instrucciones_entrega = premio.instrucciones_entrega,
                    sponsor_nombre = premio.sponsor_nombre,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return nueva.id_dinamica;
        }


    }
}