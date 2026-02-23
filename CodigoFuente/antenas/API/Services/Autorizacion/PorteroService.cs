using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;


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
                await LogScan(null, qrToken, null, "ERROR", "QR inexistente",
                    deviceId, idUsuarioOperador, ip, userAgent);

                return null;
            }

            if (data.Rol != "N")
            {
                await LogScan(data.Invitado.id_evento, qrToken, data.Invitado.id_invitado,
                    "ERROR", "No es menor",
                    deviceId, idUsuarioOperador, ip, userAgent);

                throw new InvalidOperationException("El QR no corresponde a un menor.");
            }

            //----------------------------------------
            // 2. Buscar grupo info
            //----------------------------------------

            var grupo = await _context.ef_rsvp_grupos
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.id_rsvp_grupo == data.GrupoId);

            //----------------------------------------
            // 3. Verificar si ya fue retirado
            //----------------------------------------

            var ultimoRetiro = await _context.ef_retiros
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

            var yaRetirado = ultimoRetiro != null;

            //----------------------------------------
            // 4. Buscar autorizados
            //----------------------------------------

            var autorizados = await _context.ef_autorizaciones
                .AsNoTracking()
                .Where(a =>
                    a.id_evento == data.Invitado.id_evento &&
                    a.id_invitado_objetivo == data.Invitado.id_invitado &&
                    a.tipo == "R" &&
                    a.activo)
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

            //----------------------------------------
            // 5. Registrar scan OK
            //----------------------------------------

            await LogScan(
                data.Invitado.id_evento,
                qrToken,
                data.Invitado.id_invitado,
                "OK",
                null,
                deviceId,
                idUsuarioOperador,
                ip,
                userAgent);

            //----------------------------------------
            // 6. Construir respuesta FINAL
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

                GrupoResumen = grupo != null
                    ? $"{grupo.cantidad_total} personas"
                    : null,

                YaRetirado = yaRetirado,

                UltimoRetiro = ultimoRetiro,

                AutorizadosRetiro = autorizados
            };
        }
        public async Task<RetiroConfirmResponseDTO> ConfirmarRetiroAsync(string qrToken, RetiroConfirmRequestDTO dto, long? idUsuarioOperador)
        {
            var inv = await _context.Set<ef_invitados>().SingleOrDefaultAsync(i => i.qr_token == qrToken);
            if (inv == null) throw new ArgumentException("QR inválido.");

            // Validación: el objetivo debe ser un niño (rol_evento = 'N')
            var rolEvento = await _context.Set<ef_rsvp_grupo_integrantes>()
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo == inv.id_rsvp_grupo && x.id_invitado == inv.id_invitado)
                .Select(x => x.rol_evento)
                .SingleOrDefaultAsync();

            if (rolEvento != "N")
                throw new InvalidOperationException("Este QR no corresponde a un menor.");

            // Evitar doble retiro si decidiste esa regla
            var yaRetirado = await _context.Set<ef_retiros>().AsNoTracking()
                .AnyAsync(r => r.id_invitado_nino == inv.id_invitado);

            if (yaRetirado)
                throw new InvalidOperationException("Este menor ya fue retirado.");

            // Normalizar celular del retirador (si vino)
            var cel = PhoneUtilHelper.NormalizeE164(dto.CelularRetirador, "AR");
            if (dto.CelularRetirador != null && cel == null)
                throw new ArgumentException("Celular del retirador inválido.");

            // Si informan IdAutorizacion, validar que sea para este niño y activa
            long? idAutOk = null;
            if (dto.IdAutorizacion.HasValue)
            {
                var aut = await _context.Set<ef_autorizaciones>()
                    .AsNoTracking()
                    .SingleOrDefaultAsync(a => a.id_autorizacion == dto.IdAutorizacion.Value
                                               && a.id_evento == inv.id_evento
                                               && a.id_invitado_objetivo == inv.id_invitado
                                               && a.tipo == "R"
                                               && a.activo);

                if (aut == null)
                    throw new InvalidOperationException("La autorización indicada no es válida para este menor.");

                idAutOk = aut.id_autorizacion;
            }

            var retiro = new ef_retiros
            {
                id_evento = inv.id_evento,
                id_invitado_nino = inv.id_invitado,
                id_autorizacion = idAutOk,
                nombre_retirador = dto.NombreRetirador,
                celular_retirador = cel,
                metodo_validacion = dto.MetodoValidacion,
                observaciones = dto.Observaciones,
                fecha_retiro = DateTimeOffset.UtcNow,
                id_usuario_operador = idUsuarioOperador
            };

            _context.Add(retiro);
            await _context.SaveChangesAsync();

            return new RetiroConfirmResponseDTO
            {
                IdRetiro = retiro.id_retiro,
                IdEvento = retiro.id_evento,
                IdInvitadoNino = retiro.id_invitado_nino,
                FechaRetiro = retiro.fecha_retiro
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
    }
}