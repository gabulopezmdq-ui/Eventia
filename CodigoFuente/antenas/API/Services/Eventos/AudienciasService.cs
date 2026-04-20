using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace API.Services
{
    public class AudienciasService : IAudienciasService
    {
        private readonly DataContext _context;

        public AudienciasService(DataContext context)
        {
            _context = context;
        }

        public async Task<EventoCaptacionRegistroResponse> RegistrarDesdeLinkAsync(string token, EventoCaptacionRegistroRequest req)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new Exception("token obligatorio.");

            if (string.IsNullOrWhiteSpace(req.nombre))
                throw new Exception("nombre obligatorio.");

            if (string.IsNullOrWhiteSpace(req.apellido))
                throw new Exception("apellido obligatorio.");

            if (!req.acepta_terminos)
                throw new Exception("Debe aceptar términos.");

            var link = await _context.Set<ef_evento_acceso_links>()
                .Include(x => x.acceso)
                .SingleOrDefaultAsync(x => x.token == token && x.activo);

            if (link == null)
                throw new Exception("Link inexistente o inactivo.");

            if (link.id_evento <= 0)
                throw new Exception("El link no tiene evento asociado.");

            if (link.fecha_expiracion.HasValue && link.fecha_expiracion.Value < DateTimeOffset.UtcNow)
                throw new Exception("El link está vencido.");


            var evento = await _context.Set<ef_eventos>()
                .SingleAsync(x => x.id_evento == link.id_evento);

            long? idAudiencia = null;
            long? idBeneficio = null;
            string? codigoCanje = null;
            bool beneficioOtorgado = false;

            await using var tx = await _context.Database.BeginTransactionAsync();

            var invitado = new ef_invitados
            {
                id_evento = evento.id_evento,
                nombre = req.nombre.Trim(),
                apellido = req.apellido.Trim(),
                email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim(),
                celular = string.IsNullOrWhiteSpace(req.celular) ? null : req.celular.Trim(),
                rsvp_token = GenerarTokenSeguro(32),
                rsvp_estado = "Y",
                fecha_rsvp = DateTimeOffset.UtcNow,
                fecha_alta = DateTimeOffset.UtcNow,
                activo = true,
                qr_token = GenerarTokenSeguro(32),
                id_acceso = link.id_acceso,
                id_acceso_link = link.id_acceso_link,
                es_titular_grupo = true
            };

            _context.Set<ef_invitados>().Add(invitado);
            await _context.SaveChangesAsync();

            var perfil = new ef_invitados_perfiles
            {
                id_invitado = invitado.id_invitado,
                fecha_nacimiento = req.fecha_nacimiento,
                edad_anios = req.fecha_nacimiento.HasValue ? CalcularEdad(req.fecha_nacimiento.Value) : null,
                instagram = string.IsNullOrWhiteSpace(req.instagram) ? null : req.instagram.Trim(),
                zona = string.IsNullOrWhiteSpace(req.zona) ? null : req.zona.Trim(),
                ciudad = string.IsNullOrWhiteSpace(req.ciudad) ? null : req.ciudad.Trim(),
                id_perfil_asistencia = req.id_perfil_asistencia,
                acepta_terminos = req.acepta_terminos,
                acepta_comunicaciones = req.acepta_comunicaciones,
                acepta_promociones = req.acepta_promociones,
                origen_registro = string.IsNullOrWhiteSpace(req.origen_registro) ? link.origen_default : req.origen_registro.Trim(),
                campania_fuente = req.campania_fuente,
                campania_medio = req.campania_medio,
                campania_nombre = req.campania_nombre,
                campania_contenido = req.campania_contenido,
                campania_termino = req.campania_termino,
                pagina_origen = req.pagina_origen,
                referer = req.referer,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_invitados_perfiles>().Add(perfil);

            foreach (var idInteres in req.id_intereses_evento.Distinct())
            {
                _context.Set<ef_invitado_intereses_evento>().Add(new ef_invitado_intereses_evento
                {
                    id_invitado = invitado.id_invitado,
                    id_interes_evento_publico = idInteres,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }

            foreach (var idPref in req.id_preferencias_musicales.Distinct())
            {
                _context.Set<ef_invitado_preferencias_musicales>().Add(new ef_invitado_preferencias_musicales
                {
                    id_invitado = invitado.id_invitado,
                    id_preferencia_musical = idPref,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            ef_audiencias_personas? audiencia = null;

            if (evento.id_cuenta.HasValue)
            {
                audiencia = await BuscarAudienciaAsync(evento.id_cuenta.Value, invitado.email, invitado.celular);

                if (audiencia == null)
                {
                    audiencia = new ef_audiencias_personas
                    {
                        id_cuenta = evento.id_cuenta.Value,
                        nombre = invitado.nombre,
                        apellido = invitado.apellido,
                        email = invitado.email,
                        celular = invitado.celular,
                        fecha_nacimiento = req.fecha_nacimiento,
                        instagram = req.instagram,
                        zona = req.zona,
                        ciudad = req.ciudad,
                        acepta_comunicaciones = req.acepta_comunicaciones,
                        acepta_promociones = req.acepta_promociones,
                        activo = true,
                        fecha_alta = DateTimeOffset.UtcNow
                    };

                    _context.Set<ef_audiencias_personas>().Add(audiencia);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    audiencia.nombre = invitado.nombre;
                    audiencia.apellido = invitado.apellido;
                    audiencia.email = string.IsNullOrWhiteSpace(audiencia.email) ? invitado.email : audiencia.email;
                    audiencia.celular = string.IsNullOrWhiteSpace(audiencia.celular) ? invitado.celular : audiencia.celular;
                    audiencia.fecha_nacimiento = audiencia.fecha_nacimiento ?? req.fecha_nacimiento;
                    audiencia.instagram = string.IsNullOrWhiteSpace(audiencia.instagram) ? req.instagram : audiencia.instagram;
                    audiencia.zona = string.IsNullOrWhiteSpace(audiencia.zona) ? req.zona : audiencia.zona;
                    audiencia.ciudad = string.IsNullOrWhiteSpace(audiencia.ciudad) ? req.ciudad : audiencia.ciudad;
                    audiencia.acepta_comunicaciones = audiencia.acepta_comunicaciones || req.acepta_comunicaciones;
                    audiencia.acepta_promociones = audiencia.acepta_promociones || req.acepta_promociones;
                    audiencia.fecha_modif = DateTimeOffset.UtcNow;
                    await _context.SaveChangesAsync();
                }

                idAudiencia = audiencia.id_audiencia_persona;

                bool beneficioDisponible = true;
                if (link.cupo_beneficio.HasValue)
                {
                    int yaOtorgados = await _context.Set<ef_evento_beneficios_registro>()
                        .CountAsync(x => x.id_acceso_link == link.id_acceso_link);

                    beneficioDisponible = yaOtorgados < link.cupo_beneficio.Value;
                }

                if (link.id_tipo_beneficio_registro.HasValue && beneficioDisponible)
                {
                    var beneficio = new ef_evento_beneficios_registro
                    {
                        id_evento = evento.id_evento,
                        id_invitado = invitado.id_invitado,
                        id_acceso_link = link.id_acceso_link,
                        id_tipo_beneficio_registro = link.id_tipo_beneficio_registro.Value,
                        titulo_snapshot = link.beneficio_titulo ?? "Beneficio",
                        descripcion_snapshot = link.beneficio_descripcion,
                        estado = "G",
                        codigo_canje = GenerarTokenSeguro(12),
                        fecha_otorgado = DateTimeOffset.UtcNow,
                        fecha_vencimiento = link.beneficio_hasta
                    };

                    _context.Set<ef_evento_beneficios_registro>().Add(beneficio);
                    await _context.SaveChangesAsync();

                    idBeneficio = beneficio.id_beneficio_registro;
                    codigoCanje = beneficio.codigo_canje;
                    beneficioOtorgado = true;
                }

                _context.Set<ef_audiencia_persona_eventos>().Add(new ef_audiencia_persona_eventos
                {
                    id_audiencia_persona = audiencia.id_audiencia_persona,
                    id_evento = evento.id_evento,
                    id_unidad = evento.id_unidad,
                    id_invitado = invitado.id_invitado,
                    id_acceso = link.id_acceso,
                    id_acceso_link = link.id_acceso_link,
                    origen_registro = perfil.origen_registro,
                    registrado = true,
                    asistio = false,
                    beneficio_otorgado = beneficioOtorgado,
                    beneficio_canjeado = false,
                    fecha_registro = DateTimeOffset.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            await tx.CommitAsync();

            return new EventoCaptacionRegistroResponse
            {
                ok = true,
                id_invitado = invitado.id_invitado,
                id_audiencia_persona = idAudiencia ?? 0,
                beneficio_otorgado = beneficioOtorgado,
                id_beneficio_registro = idBeneficio,
                codigo_canje = codigoCanje,
                rsvp_token = invitado.rsvp_token,
                qr_token = invitado.qr_token,
                mensaje_post_registro = link.mensaje_post_registro
            };
        }

        public async Task<List<AudienciaRegistroEventoDTO>> GetRegistrosEventoAsync(long idUsuario, long idEvento)
        {
            await ValidarUsuarioPerteneceEvento(idUsuario, idEvento);

            var data = await (
                from i in _context.Set<ef_invitados>().AsNoTracking()
                join p in _context.Set<ef_invitados_perfiles>().AsNoTracking()
                    on i.id_invitado equals p.id_invitado into pj
                from p in pj.DefaultIfEmpty()
                join a in _context.Set<ef_evento_accesos>().AsNoTracking()
                    on i.id_acceso equals a.id_acceso into aj
                from a in aj.DefaultIfEmpty()
                join ape in _context.Set<ef_audiencia_persona_eventos>().AsNoTracking()
                    on i.id_invitado equals ape.id_invitado into apej
                from ape in apej.DefaultIfEmpty()
                where i.id_evento == idEvento
                orderby i.fecha_alta descending
                select new
                {
                    i.id_invitado,
                    ape_id_audiencia_persona = ape != null ? (long?)ape.id_audiencia_persona : null,
                    i.nombre,
                    i.apellido,
                    i.email,
                    i.celular,
                    i.fecha_alta,
                    i.rsvp_estado,
                    i.id_acceso,
                    acceso_nombre = a != null ? a.nombre : null,
                    ape_id_acceso_link = ape != null ? ape.id_acceso_link : null,
                    origen_registro = p != null ? p.origen_registro : null,
                    id_perfil_asistencia = p != null ? p.id_perfil_asistencia : null,
                    acepta_comunicaciones = p != null && p.acepta_comunicaciones,
                    acepta_promociones = p != null && p.acepta_promociones,
                    beneficio_otorgado = ape != null && ape.beneficio_otorgado,
                    beneficio_canjeado = ape != null && ape.beneficio_canjeado,
                    asistio = ape != null && ape.asistio
                }
            ).ToListAsync();

            var idsInvitados = data.Select(x => x.id_invitado).ToList();

            var intereses = await (
                from x in _context.Set<ef_invitado_intereses_evento>().AsNoTracking()
                join p in _context.Set<ef_param_intereses_evento_publico>().AsNoTracking()
                    on x.id_interes_evento_publico equals p.id_interes_evento_publico
                where idsInvitados.Contains(x.id_invitado)
                select new { x.id_invitado, p.codigo }
            ).ToListAsync();

            var prefs = await (
                from x in _context.Set<ef_invitado_preferencias_musicales>().AsNoTracking()
                join p in _context.Set<ef_param_preferencias_musicales>().AsNoTracking()
                    on x.id_preferencia_musical equals p.id_preferencia_musical
                where idsInvitados.Contains(x.id_invitado)
                select new { x.id_invitado, p.codigo }
            ).ToListAsync();

            return data.Select(x => new AudienciaRegistroEventoDTO
            {
                id_invitado = x.id_invitado,
                id_audiencia_persona = x.ape_id_audiencia_persona,
                nombre = x.nombre,
                apellido = x.apellido,
                email = x.email,
                celular = x.celular,
                fecha_alta = x.fecha_alta,
                rsvp_estado = x.rsvp_estado,
                id_acceso = x.id_acceso,
                acceso_nombre = x.acceso_nombre,
                id_acceso_link = x.ape_id_acceso_link,
                origen_registro = x.origen_registro,
                id_perfil_asistencia = x.id_perfil_asistencia,
                intereses = intereses.Where(z => z.id_invitado == x.id_invitado).Select(z => z.codigo).Distinct().ToList(),
                preferencias_musicales = prefs.Where(z => z.id_invitado == x.id_invitado).Select(z => z.codigo).Distinct().ToList(),
                acepta_comunicaciones = x.acepta_comunicaciones,
                acepta_promociones = x.acepta_promociones,
                beneficio_otorgado = x.beneficio_otorgado,
                beneficio_canjeado = x.beneficio_canjeado,
                asistio = x.asistio
            }).ToList();
        }

        public async Task<AudienciaEventoMetricasDTO> GetMetricasEventoAsync(long idUsuario, long idEvento)
        {
            await ValidarUsuarioPerteneceEvento(idUsuario, idEvento);

            int registrados = await _context.Set<ef_audiencia_persona_eventos>()
                .CountAsync(x => x.id_evento == idEvento && x.registrado);

            int asistieron = await _context.Set<ef_audiencia_persona_eventos>()
                .CountAsync(x => x.id_evento == idEvento && x.asistio);

            int otorgados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_evento == idEvento);

            int canjeados = await _context.Set<ef_evento_beneficios_registro>()
                .CountAsync(x => x.id_evento == idEvento && x.estado == "C");

            return new AudienciaEventoMetricasDTO
            {
                id_evento = idEvento,
                registrados = registrados,
                asistieron = asistieron,
                no_show = registrados - asistieron,
                conversion_asistencia = registrados > 0
                    ? Math.Round((decimal)asistieron * 100m / registrados, 2)
                    : 0,
                beneficios_otorgados = otorgados,
                beneficios_canjeados = canjeados
            };
        }

        public async Task<List<AudienciaPersonaDTO>> GetAudienciasCuentaAsync(long idUsuario, bool soloActivas = true)
        {
            long idCuenta = await GetCuentaIdActualAsync(idUsuario);

            var personas = await _context.Set<ef_audiencias_personas>()
                .AsNoTracking()
                .Where(x => x.id_cuenta == idCuenta && (!soloActivas || x.activo))
                .OrderByDescending(x => x.fecha_alta)
                .ToListAsync();

            var ids = personas.Select(x => x.id_audiencia_persona).ToList();

            var historial = await _context.Set<ef_audiencia_persona_eventos>()
                .AsNoTracking()
                .Where(x => ids.Contains(x.id_audiencia_persona))
                .ToListAsync();

            var tags = await _context.Set<ef_audiencia_persona_tags>()
                .AsNoTracking()
                .Where(x => ids.Contains(x.id_audiencia_persona) && x.activo)
                .ToListAsync();

            return personas.Select(x =>
            {
                var h = historial.Where(z => z.id_audiencia_persona == x.id_audiencia_persona).ToList();
                var t = tags.Where(z => z.id_audiencia_persona == x.id_audiencia_persona)
                    .Select(z => z.tag_valor)
                    .Distinct()
                    .ToList();

                return new AudienciaPersonaDTO
                {
                    id_audiencia_persona = x.id_audiencia_persona,
                    nombre = x.nombre,
                    apellido = x.apellido,
                    email = x.email,
                    celular = x.celular,
                    fecha_nacimiento = x.fecha_nacimiento,
                    instagram = x.instagram,
                    zona = x.zona,
                    ciudad = x.ciudad,
                    acepta_comunicaciones = x.acepta_comunicaciones,
                    acepta_promociones = x.acepta_promociones,
                    activo = x.activo,
                    fecha_alta = x.fecha_alta,
                    eventos_registrados = h.Count(z => z.registrado),
                    eventos_asistidos = h.Count(z => z.asistio),
                    ultima_participacion = h.OrderByDescending(z => z.fecha_registro).Select(z => (DateTimeOffset?)z.fecha_registro).FirstOrDefault(),
                    tags = t
                };
            }).ToList();
        }

        public async Task<AudienciaDetalleDTO> GetAudienciaDetalleAsync(long idUsuario, long idAudienciaPersona)
        {
            long idCuenta = await GetCuentaIdActualAsync(idUsuario);

            var persona = await _context.Set<ef_audiencias_personas>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_audiencia_persona == idAudienciaPersona && x.id_cuenta == idCuenta);

            if (persona == null)
                throw new Exception("Audiencia inexistente.");

            var tags = await _context.Set<ef_audiencia_persona_tags>()
                .AsNoTracking()
                .Where(x => x.id_audiencia_persona == idAudienciaPersona && x.activo)
                .OrderBy(x => x.tag_tipo)
                .ThenBy(x => x.tag_valor)
                .Select(x => x.tag_valor)
                .ToListAsync();

            var historial = await (
                from ape in _context.Set<ef_audiencia_persona_eventos>().AsNoTracking()
                join e in _context.Set<ef_eventos>().AsNoTracking()
                    on ape.id_evento equals e.id_evento
                join u in _context.Set<ef_cuenta_unidades>().AsNoTracking()
                    on ape.id_unidad equals u.id_unidad into uj
                from u in uj.DefaultIfEmpty()
                where ape.id_audiencia_persona == idAudienciaPersona
                orderby ape.fecha_registro descending
                select new AudienciaDetalleEventoDTO
                {
                    id_evento = e.id_evento,
                    evento_nombre = e.anfitriones_texto,
                    unidad = u != null ? u.nombre : null,
                    fecha_registro = ape.fecha_registro,
                    asistio = ape.asistio,
                    origen_registro = ape.origen_registro,
                    beneficio_otorgado = ape.beneficio_otorgado,
                    beneficio_canjeado = ape.beneficio_canjeado
                }
            ).ToListAsync();

            return new AudienciaDetalleDTO
            {
                id_audiencia_persona = persona.id_audiencia_persona,
                id_cuenta = persona.id_cuenta,
                nombre = persona.nombre,
                apellido = persona.apellido,
                email = persona.email,
                celular = persona.celular,
                fecha_nacimiento = persona.fecha_nacimiento,
                instagram = persona.instagram,
                zona = persona.zona,
                ciudad = persona.ciudad,
                acepta_comunicaciones = persona.acepta_comunicaciones,
                acepta_promociones = persona.acepta_promociones,
                activo = persona.activo,
                fecha_alta = persona.fecha_alta,
                tags = tags,
                historial = historial
            };
        }

        private async Task ValidarUsuarioPerteneceEvento(long idUsuario, long idEvento)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo);

            if (!pertenece)
                throw new UnauthorizedAccessException("El usuario no pertenece al evento.");
        }

        private async Task<long> GetCuentaIdActualAsync(long idUsuario)
        {
            var idCuenta = await _context.Set<ef_cuenta_usuarios>()
                .Where(x => x.id_usuario == idUsuario && x.activo)
                .Select(x => x.id_cuenta)
                .FirstOrDefaultAsync();

            if (idCuenta <= 0)
                throw new UnauthorizedAccessException("El usuario no tiene cuenta activa.");

            return idCuenta;
        }

        private async Task<ef_audiencias_personas?> BuscarAudienciaAsync(long idCuenta, string? email, string? celular)
        {
            email = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
            celular = string.IsNullOrWhiteSpace(celular) ? null : celular.Trim();

            if (!string.IsNullOrWhiteSpace(email))
            {
                var byEmail = await _context.Set<ef_audiencias_personas>()
                    .FirstOrDefaultAsync(x => x.id_cuenta == idCuenta && x.email != null && x.email.ToLower() == email);

                if (byEmail != null)
                    return byEmail;
            }

            if (!string.IsNullOrWhiteSpace(celular))
            {
                var byCel = await _context.Set<ef_audiencias_personas>()
                    .FirstOrDefaultAsync(x => x.id_cuenta == idCuenta && x.celular == celular);

                if (byCel != null)
                    return byCel;
            }

            return null;
        }

        private short? CalcularEdad(DateTime fechaNacimiento)
        {
            var hoy = DateTime.UtcNow.Date;
            int edad = hoy.Year - fechaNacimiento.Year;
            if (fechaNacimiento.Date > hoy.AddYears(-edad)) edad--;
            return edad >= 0 ? (short?)edad : null;
        }

        private string GenerarTokenSeguro(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            using var rng = RandomNumberGenerator.Create();
            var data = new byte[length];
            rng.GetBytes(data);
            return new string(data.Select(x => chars[x % chars.Length]).ToArray());
        }
    }
}