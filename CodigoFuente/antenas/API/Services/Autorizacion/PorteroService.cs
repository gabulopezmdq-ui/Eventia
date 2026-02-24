using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace API.Services
{
    public class PorteroService : IPorteroService
    {
        private readonly DataContext _context;

        public PorteroService(DataContext context)
        {
            _context = context;
        }

        public async Task<QrScanResponseRetiroDTO?> ScanQrAsync(
            string qrToken,
            string? deviceId,
            long? idUsuarioOperador,
            string? ip,
            string? userAgent)
        {
            //----------------------------------------
            // 1. Buscar invitado + grupo + rol
            //----------------------------------------
            var data = await (
                from i in _context.ef_invitados
                join gi in _context.ef_rsvp_grupo_integrantes
                    on i.id_invitado equals gi.id_invitado
                where i.qr_token == qrToken
                select new
                {
                    Invitado = i,
                    Rol = gi.rol_evento,
                    GrupoId = gi.id_rsvp_grupo
                }
            ).FirstOrDefaultAsync();

            if (data == null)
            {
                await LogScan(null, qrToken, null, "E", "QR inexistente",
                    deviceId, idUsuarioOperador, ip, userAgent);
                return null;
            }

            //----------------------------------------
            // 2. Registrar scan exitoso (código 'O' = OK)
            //----------------------------------------
            await LogScan(
                data.Invitado.id_evento,
                qrToken,
                data.Invitado.id_invitado,
                "O",                // ← valor permitido por la constraint
                null,
                deviceId,
                idUsuarioOperador,
                ip,
                userAgent);

            //----------------------------------------
            // 3. Obtener información del grupo
            //----------------------------------------
            var grupo = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == data.GrupoId);

            //----------------------------------------
            // 4. Determinar niños involucrados y autorizaciones
            //----------------------------------------
            List<long> idsNinos = new();
            List<AutorizacionDTO> autorizados = new();

            if (data.Rol == "N")
            {
                // Es un niño: solo él mismo
                idsNinos.Add(data.Invitado.id_invitado);

                // Autorizaciones de este niño
                autorizados = await _context.ef_autorizaciones
                    .AsNoTracking()
                    .Where(a => a.id_evento == data.Invitado.id_evento
                             && a.id_invitado_objetivo == data.Invitado.id_invitado
                             && a.tipo == "R"
                             && a.activo)
                    .Select(a => new AutorizacionDTO
                    {
                        IdAutorizacion = a.id_autorizacion,
                        IdEvento = a.id_evento,
                        IdInvitadoObjetivo = a.id_invitado_objetivo,
                        Tipo = a.tipo,
                        NombreAutorizado = a.nombre_autorizado,
                        TelefonoAutorizado = a.telefono_autorizado,
                        Relacion = a.relacion,
                        Observaciones = a.observaciones,
                        Activo = a.activo
                    })
                    .ToListAsync();
            }
            else // Rol == "R" (responsable) u otros
            {
                // Es responsable: obtener todos los niños del grupo
                idsNinos = await _context.ef_rsvp_grupo_integrantes
                    .Where(x => x.id_rsvp_grupo == data.GrupoId && x.rol_evento == "N")
                    .Select(x => x.id_invitado)
                    .ToListAsync();

                if (idsNinos.Any())
                {
                    // Autorizaciones de TODOS los niños del grupo (para mostrarlas en la UI)
                    autorizados = await _context.ef_autorizaciones
                        .AsNoTracking()
                        .Where(a => a.id_evento == data.Invitado.id_evento
                                 && idsNinos.Contains(a.id_invitado_objetivo)
                                 && a.tipo == "R"
                                 && a.activo)
                        .Select(a => new AutorizacionDTO
                        {
                            IdAutorizacion = a.id_autorizacion,
                            IdEvento = a.id_evento,
                            IdInvitadoObjetivo = a.id_invitado_objetivo,
                            Tipo = a.tipo,
                            NombreAutorizado = a.nombre_autorizado,
                            TelefonoAutorizado = a.telefono_autorizado,
                            Relacion = a.relacion,
                            Observaciones = a.observaciones,
                            Activo = a.activo
                        })
                        .ToListAsync();
                }
            }

            //----------------------------------------
            // 5. Verificar si ya fue retirado (solo si es niño)
            //----------------------------------------
            UltimoRetiroDTO? ultimoRetiro = null;
            bool yaRetirado = false;
            if (data.Rol == "N")
            {
                ultimoRetiro = await _context.ef_retiros
                    .Where(r => r.id_invitado_nino == data.Invitado.id_invitado)
                    .OrderByDescending(r => r.fecha_retiro)
                    .Select(r => new UltimoRetiroDTO
                    {
                        IdRetiro = r.id_retiro,
                        FechaRetiro = r.fecha_retiro,
                        NombreRetirador = r.nombre_retirador,
                        CelularRetirador = r.celular_retirador
                    })
                    .FirstOrDefaultAsync();
                yaRetirado = ultimoRetiro != null;
            }

            //----------------------------------------
            // 6. Construir respuesta
            //----------------------------------------
            return new QrScanResponseRetiroDTO
            {
                IdEvento = data.Invitado.id_evento,
                IdInvitado = data.Invitado.id_invitado,
                Nombre = data.Invitado.nombre,
                Apellido = data.Invitado.apellido,
                RolEvento = data.Rol,
                RsvpEstado = data.Invitado.rsvp_estado,
                IdRsvpGrupo = data.GrupoId,
                GrupoResumen = grupo != null ? $"{grupo.cantidad_total} personas" : null,
                // Si es niño, estos campos aplican; si es responsable, se envían vacíos o con valores genéricos
                YaRetirado = yaRetirado,
                UltimoRetiro = ultimoRetiro,
                // Lista de autorizados (para el niño o para todos los niños del grupo)
                AutorizadosRetiro = autorizados
            };
        }
        public async Task<RetiroConfirmResponseDTO> ConfirmarRetiroAsync(string qrToken, RetiroConfirmRequestDTO dto, long? idUsuarioOperador)
        {
            // 1. Buscar invitado por QR
            var invitado = await _context.ef_invitados
                .FirstOrDefaultAsync(i => i.qr_token == qrToken);
            if (invitado == null)
                throw new ArgumentException("QR inválido.");

            // 2. Obtener su grupo y rol
            var integrante = await _context.ef_rsvp_grupo_integrantes
                .Where(x => x.id_invitado == invitado.id_invitado)
                .Select(x => new { x.rol_evento, x.id_rsvp_grupo })
                .FirstOrDefaultAsync();
            if (integrante == null)
                throw new InvalidOperationException("El invitado no pertenece a un grupo.");

            // 3. Obtener todos los niños del grupo (rol_evento = 'N')
            var ninosDelGrupo = await _context.ef_rsvp_grupo_integrantes
                .Where(x => x.id_rsvp_grupo == integrante.id_rsvp_grupo && x.rol_evento == "N")
                .Select(x => x.id_invitado)
                .ToListAsync();

            if (!ninosDelGrupo.Any())
                throw new InvalidOperationException("El grupo no tiene niños a cargo.");

            // 4. Filtrar los niños que aún no han sido retirados
            var idsYaRetirados = await _context.ef_retiros
                .Where(r => ninosDelGrupo.Contains(r.id_invitado_nino))
                .Select(r => r.id_invitado_nino)
                .ToListAsync();

            var idsPendientes = ninosDelGrupo.Except(idsYaRetirados).ToList();

            if (!idsPendientes.Any())
                throw new InvalidOperationException("Todos los niños del grupo ya fueron retirados.");

            // 5. Validar que el nombre del retirador esté autorizado para CADA niño pendiente
            var autorizaciones = await _context.ef_autorizaciones
                .Where(a => a.id_evento == invitado.id_evento
                         && idsPendientes.Contains(a.id_invitado_objetivo)
                         && a.tipo == "R"
                         && a.activo)
                .ToListAsync();

            // Verificar por cada niño si existe una autorización con ese nombre
            var nombresAutorizadosPorNino = autorizaciones
                .GroupBy(a => a.id_invitado_objetivo)
                .ToDictionary(g => g.Key, g => g.Select(a => a.nombre_autorizado).Distinct().ToList());

            foreach (var idNino in idsPendientes)
            {
                if (!nombresAutorizadosPorNino.ContainsKey(idNino) ||
                    !nombresAutorizadosPorNino[idNino].Contains(dto.NombreRetirador, StringComparer.OrdinalIgnoreCase))
                {
                    throw new UnauthorizedAccessException($"'{dto.NombreRetirador}' no está autorizado para retirar al niño con ID {idNino}.");
                }
            }

            // 6. Normalizar celular (opcional)
            string? cel = null;
            if (!string.IsNullOrWhiteSpace(dto.CelularRetirador))
            {
                cel = PhoneUtilHelper.NormalizeE164(dto.CelularRetirador, "AR");
                if (cel == null)
                    throw new ArgumentException("Celular del retirador inválido.");
            }

            // 7. Registrar retiros para todos los niños pendientes
            var retiros = new List<ef_retiros>();
            foreach (var idNino in idsPendientes)
            {
                // Buscar la autorización específica (opcional, puede haber varias)
                var autorizacion = autorizaciones.FirstOrDefault(a => a.id_invitado_objetivo == idNino && a.nombre_autorizado == dto.NombreRetirador);

                var retiro = new ef_retiros
                {
                    id_evento = invitado.id_evento,
                    id_invitado_nino = idNino,
                    id_autorizacion = autorizacion?.id_autorizacion,
                    nombre_retirador = dto.NombreRetirador,
                    celular_retirador = cel,
                    metodo_validacion = dto.MetodoValidacion,
                    observaciones = dto.Observaciones,
                    fecha_retiro = DateTimeOffset.UtcNow,
                    id_usuario_operador = idUsuarioOperador
                };
                retiros.Add(retiro);
            }

            _context.ef_retiros.AddRange(retiros);
            await _context.SaveChangesAsync();

            // 8. Log del scan (opcional, con código 'R' para retiro)
            await LogScan(invitado.id_evento, qrToken, invitado.id_invitado, "O",
                $"Retiro de {retiros.Count} niños por {dto.NombreRetirador}",
                null, idUsuarioOperador, null, null);

            // 9. Respuesta (podemos devolver el primer retiro o un resumen)
            return new RetiroConfirmResponseDTO
            {
                IdRetiro = retiros.First().id_retiro,
                IdEvento = retiros.First().id_evento,
                IdInvitadoNino = retiros.First().id_invitado_nino,
                FechaRetiro = retiros.First().fecha_retiro,
                // Opcional: agregar cantidad
                CantidadRetirados = retiros.Count
            };
        }

        private async Task LogScan(long? idEvento, string qrToken, long? idInvitado, string resultado, string? mensaje,
            string? deviceId, long? idUsuarioOperador, string? ip, string? userAgent)
        {
            _context.Add(new ef_qr_scans
            {
                id_evento = idEvento,
                qr_token = qrToken,
                id_invitado = idInvitado,
                resultado = resultado,
                mensaje = mensaje,
                fecha_scan = DateTimeOffset.UtcNow,
                id_usuario_operador = idUsuarioOperador,
                device_id = deviceId,
                ip = ip,
                user_agent = userAgent
            });

            await _context.SaveChangesAsync();
        }

        public async Task<List<RetiroListItemDTO>> ListRetirosAsync(long idEvento, DateTimeOffset? desde, DateTimeOffset? hasta)
        {
            var q = from r in _context.Set<ef_retiros>().AsNoTracking()
                    join i in _context.Set<ef_invitados>().AsNoTracking() on r.id_invitado_nino equals i.id_invitado
                    where r.id_evento == idEvento
                    select new { r, i };

            if (desde.HasValue) q = q.Where(x => x.r.fecha_retiro >= desde.Value);
            if (hasta.HasValue) q = q.Where(x => x.r.fecha_retiro <= hasta.Value);

            return await q.OrderByDescending(x => x.r.fecha_retiro)
                .Select(x => new RetiroListItemDTO
                {
                    IdRetiro = x.r.id_retiro,
                    FechaRetiro = x.r.fecha_retiro,
                    IdInvitadoNino = x.i.id_invitado,
                    NinoNombre = x.i.nombre,
                    NinoApellido = x.i.apellido,
                    NombreRetirador = x.r.nombre_retirador,
                    CelularRetirador = x.r.celular_retirador,
                    MetodoValidacion = x.r.metodo_validacion
                })
                .ToListAsync();
        }

        public async Task<List<ScanListItemDTO>> ListScansAsync(long idEvento, DateTimeOffset? desde, DateTimeOffset? hasta, string? resultado)
        {
            var q = from s in _context.Set<ef_qr_scans>().AsNoTracking()
                    join i in _context.Set<ef_invitados>().AsNoTracking() on s.id_invitado equals i.id_invitado into gi
                    from i in gi.DefaultIfEmpty()
                    where s.id_evento == idEvento
                    select new { s, i };

            if (desde.HasValue) q = q.Where(x => x.s.fecha_scan >= desde.Value);
            if (hasta.HasValue) q = q.Where(x => x.s.fecha_scan <= hasta.Value);
            if (!string.IsNullOrWhiteSpace(resultado)) q = q.Where(x => x.s.resultado == resultado);

            return await q.OrderByDescending(x => x.s.fecha_scan)
                .Select(x => new ScanListItemDTO
                {
                    IdQrScan = x.s.id_qr_scan,
                    FechaScan = x.s.fecha_scan,
                    QrToken = x.s.qr_token,
                    Resultado = x.s.resultado,
                    Mensaje = x.s.mensaje,
                    IdInvitado = x.s.id_invitado,
                    InvitadoNombre = x.i != null ? x.i.nombre : null,
                    InvitadoApellido = x.i != null ? x.i.apellido : null,
                    DeviceId = x.s.device_id,
                    Ip = x.s.ip
                })
                .ToListAsync();
        }
        public async Task<List<PendienteRetiroDTO>> ListPendientesRetiroAsync(long idEvento)
        {
            // 1) Base: niños confirmados (rol_evento='N' y rsvp_estado='Y') del evento
            // 2) Excluir los que ya tienen retiro
            var query =
                from rgiN in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join invN in _context.Set<ef_invitados>().AsNoTracking()
                    on rgiN.id_invitado equals invN.id_invitado
                where invN.id_evento == idEvento
                      && invN.rsvp_estado == "Y"
                      && rgiN.rol_evento == "N"
                      && !_context.Set<ef_retiros>().AsNoTracking().Any(r => r.id_invitado_nino == invN.id_invitado)
                select new { rgiN, invN };

            var baseRows = await query.ToListAsync();

            if (baseRows.Count == 0) return new List<PendienteRetiroDTO>();

            // Para completar Responsable + cantidad autorizados, armamos sets auxiliares
            var idsNinos = baseRows.Select(x => x.invN.id_invitado).Distinct().ToList();
            var idsGrupos = baseRows.Select(x => x.invN.id_rsvp_grupo).Where(x => x != null).Select(x => x!.Value).Distinct().ToList();

            // Responsable por grupo: rol_evento='R'
            var responsablesPorGrupo = await (
                from rgiR in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join invR in _context.Set<ef_invitados>().AsNoTracking()
                    on rgiR.id_invitado equals invR.id_invitado
                where invR.id_evento == idEvento
                      && invR.id_rsvp_grupo != null
                      && idsGrupos.Contains(invR.id_rsvp_grupo.Value)
                      && rgiR.rol_evento == "R"
                select new
                {
                    IdGrupo = invR.id_rsvp_grupo!.Value,
                    invR.nombre,
                    invR.apellido,
                    invR.celular
                }
            ).ToListAsync();

            var respDict = responsablesPorGrupo
                .GroupBy(x => x.IdGrupo)
                .ToDictionary(g => g.Key, g => g.First()); // 1 responsable por grupo

            // Cant autorizados por niño (tipo R)
            var autCounts = await _context.Set<ef_autorizaciones>().AsNoTracking()
                .Where(a => a.id_evento == idEvento
                            && a.tipo == "R"
                            && a.activo
                            && idsNinos.Contains(a.id_invitado_objetivo))
                .GroupBy(a => a.id_invitado_objetivo)
                .Select(g => new { IdNino = g.Key, Cant = g.Count() })
                .ToListAsync();

            var autDict = autCounts.ToDictionary(x => x.IdNino, x => x.Cant);

            // Armar resultado final
            var result = baseRows.Select(x =>
            {
                var idGrupo = x.invN.id_rsvp_grupo;
                respDict.TryGetValue(idGrupo ?? -1, out var resp);

                autDict.TryGetValue(x.invN.id_invitado, out var cantAut);

                return new PendienteRetiroDTO
                {
                    IdInvitadoNino = x.invN.id_invitado,
                    NinoNombre = x.invN.nombre,
                    NinoApellido = x.invN.apellido,
                    QrToken = x.invN.qr_token,

                    IdRsvpGrupo = x.invN.id_rsvp_grupo,
                    ResponsableNombre = resp?.nombre,
                    ResponsableApellido = resp?.apellido,
                    ResponsableCelular = resp?.celular,

                    CantAutorizadosRetiro = cantAut
                };
            })
            .OrderBy(x => x.NinoApellido).ThenBy(x => x.NinoNombre)
            .ToList();

            return result;
        }

        public async Task<PorteroResumenDTO> GetResumenAsync(long idEvento)
        {
            // 1) Total niños confirmados
            var totalNinosConfirmados = await (
                from rgi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on rgi.id_invitado equals inv.id_invitado
                where inv.id_evento == idEvento
                      && rgi.rol_evento == "N"
                      && inv.rsvp_estado == "Y"
                select inv.id_invitado
            ).CountAsync();

            // 2) Total retirados
            var totalRetirados = await _context.Set<ef_retiros>().AsNoTracking()
                .Where(r => r.id_evento == idEvento)
                .Select(r => r.id_invitado_nino)
                .Distinct()
                .CountAsync();

            // 3) Pendientes
            var totalPendientes = totalNinosConfirmados - totalRetirados;
            if (totalPendientes < 0) totalPendientes = 0;

            // 4) Porcentaje
            decimal porcentaje = 0;
            if (totalNinosConfirmados > 0)
                porcentaje = Math.Round((decimal)totalRetirados * 100 / totalNinosConfirmados, 2);

            // 5) Últimos 10 scans
            var ultimosScans = await (
                from s in _context.Set<ef_qr_scans>().AsNoTracking()
                join i in _context.Set<ef_invitados>().AsNoTracking()
                    on s.id_invitado equals i.id_invitado into gi
                from i in gi.DefaultIfEmpty()
                where s.id_evento == idEvento
                orderby s.fecha_scan descending
                select new ScanListItemDTO
                {
                    IdQrScan = s.id_qr_scan,
                    FechaScan = s.fecha_scan,
                    QrToken = s.qr_token,
                    Resultado = s.resultado,
                    Mensaje = s.mensaje,
                    IdInvitado = s.id_invitado,
                    InvitadoNombre = i != null ? i.nombre : null,
                    InvitadoApellido = i != null ? i.apellido : null,
                    DeviceId = s.device_id,
                    Ip = s.ip
                }
            ).Take(10).ToListAsync();

            return new PorteroResumenDTO
            {
                IdEvento = idEvento,
                TotalNinosConfirmados = totalNinosConfirmados,
                TotalRetirados = totalRetirados,
                TotalPendientes = totalPendientes,
                PorcentajeRetirado = porcentaje,
                UltimosScans = ultimosScans
            };
        }

        public async Task<RetiroConfirmResponseDTO> ConfirmarRetiroAsyncQR(
    string qrToken,
    RetiroConfirmRequestDTO dto,
    long? idUsuarioOperador = null)
        {
            // 1. Buscar invitado por QR
            var invitado = await _context.ef_invitados
                .FirstOrDefaultAsync(i => i.qr_token == qrToken);

            if (invitado == null)
                throw new ArgumentException("QR inválido.");

            // 2. Obtener su grupo y rol
            var integrante = await _context.ef_rsvp_grupo_integrantes
                .Where(x => x.id_invitado == invitado.id_invitado)
                .Select(x => new { x.rol_evento, x.id_rsvp_grupo })
                .FirstOrDefaultAsync();

            if (integrante == null)
                throw new InvalidOperationException("El invitado no pertenece a un grupo.");

            // 3. Determinar los niños a retirar
            List<long> idsNinosARetirar = new();

            if (integrante.rol_evento == "N")
            {
                // Es un niño: retiro individual
                idsNinosARetirar.Add(invitado.id_invitado);
            }
            else if (integrante.rol_evento == "R")
            {
                // Es responsable: retirar todos los niños del grupo
                idsNinosARetirar = await _context.ef_rsvp_grupo_integrantes
                    .Where(x => x.id_rsvp_grupo == integrante.id_rsvp_grupo && x.rol_evento == "N")
                    .Select(x => x.id_invitado)
                    .ToListAsync();

                if (!idsNinosARetirar.Any())
                    throw new InvalidOperationException("El responsable no tiene niños a cargo.");
            }
            else
            {
                throw new InvalidOperationException("El QR no corresponde a un niño ni a un responsable.");
            }

            // 4. Verificar qué niños no han sido retirados aún
            var idsYaRetirados = await _context.ef_retiros
                .Where(r => idsNinosARetirar.Contains(r.id_invitado_nino))
                .Select(r => r.id_invitado_nino)
                .ToListAsync();

            var idsPendientes = idsNinosARetirar.Except(idsYaRetirados).ToList();

            if (!idsPendientes.Any())
                throw new InvalidOperationException("Todos los niños seleccionados ya fueron retirados.");

            // 5. VALIDAR que el nombre del retirador esté autorizado para al menos uno de los niños pendientes
            var autorizado = await _context.ef_autorizaciones
                .AnyAsync(a => a.id_evento == invitado.id_evento
                            && idsPendientes.Contains(a.id_invitado_objetivo)
                            && a.tipo == "R"
                            && a.activo
                            && a.nombre_autorizado == dto.NombreRetirador);

            if (!autorizado)
                throw new UnauthorizedAccessException($"'{dto.NombreRetirador}' no está autorizado para retirar a estos niños.");

            // 6. Registrar retiros
            var retiros = new List<ef_retiros>();
            foreach (var idNino in idsPendientes)
            {
                retiros.Add(new ef_retiros
                {
                    id_evento = invitado.id_evento,
                    id_invitado_nino = idNino,
                    nombre_retirador = dto.NombreRetirador,
                    metodo_validacion = dto.MetodoValidacion,
                    observaciones = dto.Observaciones,
                    fecha_retiro = DateTimeOffset.UtcNow,
                    id_usuario_operador = idUsuarioOperador
                });
            }

            _context.ef_retiros.AddRange(retiros);
            await _context.SaveChangesAsync();

            // 7. Log del scan
            await LogScanRetiro(invitado, idsPendientes, idUsuarioOperador, dto.NombreRetirador);

            // 8. Respuesta
            return new RetiroConfirmResponseDTO
            {
                IdRetiro = retiros.First().id_retiro,
                IdEvento = invitado.id_evento,
                IdInvitadoNino = idsPendientes.First(),
                FechaRetiro = DateTimeOffset.UtcNow,
                Mensaje = $"Se retiraron {retiros.Count} niño(s) correctamente. Retirador: {dto.NombreRetirador}"
            };
        }

        private async Task LogScanRetiro(ef_invitados invitado, List<long> idsNinosRetirados, long? idUsuarioOperador, string nombreRetirador)
        {
            var scan = new ef_qr_scans
            {
                id_evento = invitado.id_evento,
                qr_token = invitado.qr_token,
                id_invitado = invitado.id_invitado,
                resultado = "RETIRO_EXITOSO",
                mensaje = $"Retirados {idsNinosRetirados.Count} niños por {nombreRetirador}",
                fecha_scan = DateTimeOffset.UtcNow,
                id_usuario_operador = idUsuarioOperador
            };
            _context.ef_qr_scans.Add(scan);
            await _context.SaveChangesAsync();
        }

        private async Task LogScanRetiro(ef_invitados invitado, List<long> idsNinosRetirados, long? idUsuarioOperador)
        {
            var scan = new ef_qr_scans
            {
                id_evento = invitado.id_evento,
                qr_token = invitado.qr_token,
                id_invitado = invitado.id_invitado,
                resultado = "RETIRO_EXITOSO",
                mensaje = $"Se retiraron {idsNinosRetirados.Count} niños",
                fecha_scan = DateTimeOffset.UtcNow,
                id_usuario_operador = idUsuarioOperador
            };
            _context.ef_qr_scans.Add(scan);
            await _context.SaveChangesAsync();
        }
    }
}