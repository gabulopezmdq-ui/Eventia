using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas/retiros")]
    [Authorize]
    public class programasRetirosController : ControllerBase
    {
        private readonly DataContext _context;

        public programasRetirosController(DataContext context)
        {
            _context = context;
        }

        [HttpPost("validar-qr")]
        public async Task<ActionResult<ProgramaRetiroValidarQrResponse>> ValidarQr(
            [FromBody] ProgramaRetiroValidarQrRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.QrToken))
                return BadRequest("Debe informar el QR.");

            var qrToken = req.QrToken.Trim();
            var fechaOperativa = req.FechaOperativa ?? DateOnly.FromDateTime(DateTime.UtcNow);

            var autorizaciones = await (
                from a in _context.Set<ef_autorizaciones>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on a.id_invitado_objetivo equals inv.id_invitado
                where a.qr_token == qrToken
                      && a.activo == true
                      && a.tipo == "R"
                      && inv.activo == true
                orderby inv.apellido, inv.nombre
                select new
                {
                    a.id_autorizacion,
                    a.id_evento,
                    a.nombre_autorizado,
                    a.telefono_autorizado,
                    a.relacion,
                    a.qr_token,
                    inv.id_invitado,
                    participante = inv.nombre + " " + inv.apellido
                }
            ).ToListAsync();

            if (!autorizaciones.Any())
            {
                return Ok(new ProgramaRetiroValidarQrResponse
                {
                    Valido = false,
                    Mensaje = "QR inexistente, vencido o no habilitado para retiro.",
                    QrToken = qrToken
                });
            }

            var idEvento = autorizaciones.First().id_evento;
            var idsInvitados = autorizaciones.Select(x => x.id_invitado).ToList();

            var retirosHoy = await _context.Set<ef_retiros>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.fecha_operativa == fechaOperativa &&
                    idsInvitados.Contains(x.id_invitado_nino))
                .ToListAsync();

            var first = autorizaciones.First();

            return Ok(new ProgramaRetiroValidarQrResponse
            {
                Valido = true,
                Mensaje = "QR válido.",
                IdEvento = idEvento,
                NombreAutorizado = first.nombre_autorizado,
                TelefonoAutorizado = first.telefono_autorizado,
                Relacion = first.relacion,
                QrToken = qrToken,
                ParticipantesAutorizados = autorizaciones.Select(a =>
                {
                    var retiro = retirosHoy.FirstOrDefault(r => r.id_invitado_nino == a.id_invitado);

                    return new ProgramaRetiroParticipanteDTO
                    {
                        IdInvitado = a.id_invitado,
                        IdAutorizacion = a.id_autorizacion,
                        NombreCompleto = a.participante,
                        YaRetiradoHoy = retiro != null,
                        FechaRetiro = retiro?.fecha_retiro
                    };
                }).ToList()
            });
        }

        [HttpPost("registrar")]
        public async Task<ActionResult<ProgramaRetiroRegistrarResponse>> RegistrarRetiro(
            [FromBody] ProgramaRetiroRegistrarRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.QrToken))
                return BadRequest("Debe informar el QR.");

            if (req.IdsInvitadosNinos == null || !req.IdsInvitadosNinos.Any())
                return BadRequest("Debe seleccionar al menos un participante para retirar.");

            var qrToken = req.QrToken.Trim();
            var fechaOperativa = req.FechaOperativa ?? DateOnly.FromDateTime(DateTime.UtcNow);
            var now = DateTimeOffset.UtcNow;
            var idUsuario = User.GetUserId();

            var autorizaciones = await (
                from a in _context.Set<ef_autorizaciones>()
                join inv in _context.Set<ef_invitados>()
                    on a.id_invitado_objetivo equals inv.id_invitado
                where a.qr_token == qrToken
                      && a.activo == true
                      && a.tipo == "R"
                      && inv.activo == true
                      && req.IdsInvitadosNinos.Contains(inv.id_invitado)
                select new
                {
                    Autorizacion = a,
                    Invitado = inv,
                    participante = inv.nombre + " " + inv.apellido
                }
            ).ToListAsync();

            if (!autorizaciones.Any())
                return BadRequest("El QR no autoriza a retirar los participantes seleccionados.");

            var idEvento = autorizaciones.First().Autorizacion.id_evento;

            var idsAutorizados = autorizaciones.Select(x => x.Invitado.id_invitado).ToList();

            var idsNoAutorizados = req.IdsInvitadosNinos
                .Where(id => !idsAutorizados.Contains(id))
                .ToList();

            if (idsNoAutorizados.Any())
                return BadRequest("El QR no autoriza a retirar uno o más participantes seleccionados.");

            var yaRetirados = await _context.Set<ef_retiros>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.fecha_operativa == fechaOperativa &&
                    req.IdsInvitadosNinos.Contains(x.id_invitado_nino))
                .ToListAsync();

            if (yaRetirados.Any())
                return BadRequest("Uno o más participantes ya fueron retirados en la fecha seleccionada.");

            var retirosCreados = new List<ProgramaRetiroRegistradoDTO>();

            foreach (var item in autorizaciones)
            {
                var aut = item.Autorizacion;
                var inv = item.Invitado;

                var retiro = new ef_retiros
                {
                    id_evento = aut.id_evento,
                    id_invitado_nino = inv.id_invitado,
                    id_autorizacion = aut.id_autorizacion,
                    nombre_retirador = aut.nombre_autorizado,
                    celular_retirador = aut.telefono_autorizado,
                    metodo_validacion = "A",
                    observaciones = string.IsNullOrWhiteSpace(req.Observaciones) ? null : req.Observaciones.Trim(),
                    fecha_retiro = now,
                    fecha_operativa = fechaOperativa,
                    id_usuario_operador = idUsuario
                };

                _context.Set<ef_retiros>().Add(retiro);
                await _context.SaveChangesAsync();

                retirosCreados.Add(new ProgramaRetiroRegistradoDTO
                {
                    IdRetiro = retiro.id_retiro,
                    IdInvitado = inv.id_invitado,
                    Participante = item.participante,
                    NombreRetirador = aut.nombre_autorizado,
                    FechaRetiro = retiro.fecha_retiro
                });
            }

            return Ok(new ProgramaRetiroRegistrarResponse
            {
                Ok = true,
                Mensaje = "Retiro registrado correctamente.",
                FechaOperativa = fechaOperativa,
                Retiros = retirosCreados
            });
        }

        [HttpGet("~/programas/{idEvento:long}/retiros/dia")]
        public async Task<ActionResult<ProgramaRetirosDiaDTO>> GetRetirosDia(
            long idEvento,
            [FromQuery] DateOnly fecha)
        {
            var items = await (
                from r in _context.Set<ef_retiros>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on r.id_invitado_nino equals inv.id_invitado
                where r.id_evento == idEvento
                      && r.fecha_operativa == fecha
                orderby r.fecha_retiro descending
                select new ProgramaRetiroDiaItemDTO
                {
                    IdRetiro = r.id_retiro,
                    IdInvitado = inv.id_invitado,
                    Participante = inv.nombre + " " + inv.apellido,
                    NombreRetirador = r.nombre_retirador,
                    TelefonoRetirador = r.celular_retirador,
                    MetodoValidacion = r.metodo_validacion,
                    Observaciones = r.observaciones,
                    FechaRetiro = r.fecha_retiro
                }
            ).ToListAsync();

            return Ok(new ProgramaRetirosDiaDTO
            {
                IdEvento = idEvento,
                Fecha = fecha,
                TotalRetiros = items.Count,
                Items = items
            });
        }
    }
}