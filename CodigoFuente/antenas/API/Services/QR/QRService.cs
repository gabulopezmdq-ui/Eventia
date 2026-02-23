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
    public class QrService : IQrService
    {
        private readonly DataContext _context;

        public QrService(DataContext context)
        {
            _context = context;
        }

        public async Task<QrScanResponseDTO?> GetByQrTokenAsync(string qrToken)
        {
            // 1) Invitado por QR
            var inv = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .SingleOrDefaultAsync(i => i.qr_token == qrToken);

            if (inv == null) return null;

            // 2) Buscar rol_evento desde integrantes (si está dentro de un grupo)
            string rolEvento = "A";
            if (inv.id_rsvp_grupo != null)
            {
                rolEvento = await _context.Set<ef_rsvp_grupo_integrantes>()
                    .AsNoTracking()
                    .Where(x => x.id_rsvp_grupo == inv.id_rsvp_grupo && x.id_invitado == inv.id_invitado)
                    .Select(x => x.rol_evento)
                    .SingleOrDefaultAsync() ?? "A";
            }

            // 3) Autorizados de retiro (tipo 'R')
            var autorizados = await _context.Set<ef_autorizaciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == inv.id_evento
                            && x.id_invitado_objetivo == inv.id_invitado
                            && x.tipo == "R"
                            && x.activo)
                .OrderBy(x => x.nombre_autorizado)
                .Select(x => new AutorizacionDTO
                {
                    IdAutorizacion = x.id_autorizacion,
                    IdEvento = x.id_evento,
                    IdInvitadoObjetivo = x.id_invitado_objetivo,
                    Tipo = x.tipo,
                    NombreAutorizado = x.nombre_autorizado,
                    TelefonoAutorizado = x.telefono_autorizado,
                    Relacion = x.relacion,
                    Observaciones = x.observaciones,
                    Activo = x.activo
                })
                .ToListAsync();

            // (Opcional) Resumen de grupo: útil en UI del scan
            string? resumen = null;
            if (inv.id_rsvp_grupo != null)
            {
                var names = await _context.Set<ef_rsvp_grupo_integrantes>()
                    .AsNoTracking()
                    .Where(x => x.id_rsvp_grupo == inv.id_rsvp_grupo)
                    .Join(_context.Set<ef_invitados>(), x => x.id_invitado, i => i.id_invitado, (x, i) => new { x.rol_evento, i.nombre })
                    .ToListAsync();

                var menor = names.FirstOrDefault(x => x.rol_evento == "N")?.nombre;
                var resp = names.FirstOrDefault(x => x.rol_evento == "R")?.nombre;
                if (menor != null && resp != null) resumen = $"{menor} + Resp: {resp}";
            }

            return new QrScanResponseDTO
            {
                IdEvento = inv.id_evento,
                IdInvitado = inv.id_invitado,
                Nombre = inv.nombre,
                Apellido = inv.apellido,
                RolEvento = rolEvento,
                RsvpEstado = inv.rsvp_estado,
                IdRsvpGrupo = inv.id_rsvp_grupo,
                GrupoResumen = resumen,
                AutorizadosRetiro = autorizados
            };
        }
    }
}