using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using API.DataSchema;
using API.DataSchema.DTO.Portal;

namespace API.Services.Portal
{
    public class PortalSeguridadService
    {
        private readonly DataContext _context;

        public PortalSeguridadService(DataContext context)
        {
            _context = context;
        }

        public async Task<SolicitarCodigoPortalResponseDTO> SolicitarCodigoAsync(string tokenConsulta, SolicitarCodigoPortalRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(tokenConsulta))
                throw new Exception("Token inválido.");

            // Buscar a quién pertenece el token.
            // Primero programas.
            var inscripcion = await _context.ef_programa_inscripciones
                .FirstOrDefaultAsync(x => x.token_consulta == tokenConsulta);

            string? destino = null;

            if (inscripcion != null)
            {
                destino = inscripcion.responsable_email;
                if (string.IsNullOrWhiteSpace(destino))
                    destino = inscripcion.responsable_telefono;
            }
            else
            {
                // Luego invitados B2B
                var invitado = await _context.ef_invitados.FirstOrDefaultAsync(x => x.rsvp_token == tokenConsulta);
                if (invitado != null)
                {
                    destino = invitado.email;
                    if (string.IsNullOrWhiteSpace(destino))
                        destino = invitado.celular;
                }
            }

            if (string.IsNullOrWhiteSpace(destino))
                throw new Exception("No se encontró un contacto para enviar el código.");

            var codigo = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            _context.ef_portal_validaciones.Add(new ef_portal_validaciones
            {
                token_consulta = tokenConsulta,
                codigo = codigo,
                canal = req.canal,
                destino = destino,
                validado = false,
                fecha_expiracion = DateTimeOffset.UtcNow.AddMinutes(10),
                fecha_alta = DateTimeOffset.UtcNow
            });

            await _context.SaveChangesAsync();

            return new SolicitarCodigoPortalResponseDTO
            {
                ok = true,
                mensaje = "Te enviamos un código de validación.",
                codigo_dev = codigo // quitar en producción
            };
        }

        public async Task<ValidarCodigoPortalResponseDTO> ValidarCodigoAsync(string tokenConsulta, ValidarCodigoPortalRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(tokenConsulta))
                throw new Exception("Token inválido.");

            if (req == null || string.IsNullOrWhiteSpace(req.codigo))
                throw new Exception("Código obligatorio.");

            var validacion = await _context.ef_portal_validaciones
                .Where(x =>
                    x.token_consulta == tokenConsulta &&
                    !x.validado &&
                    x.fecha_expiracion >= DateTimeOffset.UtcNow)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            if (validacion == null)
                throw new Exception("Código vencido o inexistente.");

            if (validacion.codigo != req.codigo)
                throw new Exception("Código inválido.");

            validacion.validado = true;
            validacion.fecha_validacion = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new ValidarCodigoPortalResponseDTO
            {
                ok = true,
                desbloqueado = true,
                mensaje = "Portal desbloqueado correctamente."
            };
        }

        public async Task<bool> EstaDesbloqueadoAsync(string tokenConsulta)
        {
            return await _context.ef_portal_validaciones.AnyAsync(x =>
                x.token_consulta == tokenConsulta &&
                x.validado &&
                x.fecha_validacion != null &&
                x.fecha_validacion.Value.AddHours(12) >= DateTimeOffset.UtcNow);
        }

        public async Task<List<PortalSeccionDTO>> GetSeccionesPortalAsync(long idEvento, string tipoOperacion, int idIdioma)
        {
            var aplicaPrograma = tipoOperacion == "PROGRAMA";

            var query =
                from s in _context.ef_param_portal_secciones
                join cfg in _context.ef_evento_portal_config
                    on new { id_portal_seccion = s.id_portal_seccion, id_evento = idEvento }
                    equals new { id_portal_seccion = cfg.id_portal_seccion, id_evento = cfg.id_evento }
                    into cfgJoin
                from cfg in cfgJoin.DefaultIfEmpty()
                join t in _context.ef_param_traducciones
                    on new { entidad = "PORTAL_SECCION", id_item = (long)s.id_portal_seccion, id_idioma = (short)idIdioma }
                    equals new { entidad = t.entidad, id_item = t.id_item, id_idioma = t.id_idioma }
                    into tJoin
                from tr in tJoin.DefaultIfEmpty()
                where s.activo
                      && (
                            aplicaPrograma
                                ? s.aplica_programa
                                : s.aplica_evento
                         )
                select new PortalSeccionDTO
                {
                    codigo = s.codigo,
                    titulo = tr != null ? tr.texto : s.descripcion,
                    visible = cfg == null ? true : cfg.visible,
                    orden = cfg == null ? s.orden_default : cfg.orden,
                    requiere_desbloqueo =
                        s.codigo == "SALUD" ||
                        s.codigo == "QRS_RETIRO" ||
                        s.codigo == "RETIROS" ||
                        s.codigo == "FOTOS" ||
                        s.codigo == "AUTORIZACIONES" ||
                        s.codigo == "DOCUMENTOS"
                };

            return await query
                .OrderBy(x => x.orden)
                .ToListAsync();
        }
    }
}
