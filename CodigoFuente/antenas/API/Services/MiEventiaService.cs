using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class MiEventiaService
    {
        private readonly DataContext _ctx;
        public MiEventiaService(DataContext ctx) => _ctx = ctx;

        public async Task<Guid> VincularAccesoAsync(
            string nombre,
            string email,
            string telefono,
            string tipo,               // "PROGRAMA" | "EVENTO"
            long idEvento,
            long idInscripcion,
            long? idInvitado,
            string tokenConsulta,      // Token del portal puntual (string en la BD)
            string titulo,
            string estado,
            long? grupoId = null)
        {
            // 1️⃣ Busca o crea la persona
            var normalizedEmail = email?.Trim().ToLower();
            var normalizedTelefono = telefono?.Trim();

            var persona = await _ctx.PortalPersonas
                .FirstOrDefaultAsync(p => p.Activo && 
                    ((!string.IsNullOrEmpty(normalizedEmail) && p.Email.ToLower() == normalizedEmail) || 
                     (!string.IsNullOrEmpty(normalizedTelefono) && p.Telefono == normalizedTelefono)));

            if (persona == null)
            {
                persona = new PortalPersona
                {
                    Nombre = nombre?.Trim() ?? "",
                    Email = email?.Trim() ?? "",
                    Telefono = telefono?.Trim() ?? "",
                    TokenPortal = Guid.NewGuid(),
                    Activo = true,
                    FechaAlta = DateTime.UtcNow
                };
                _ctx.PortalPersonas.Add(persona);
                await _ctx.SaveChangesAsync();
            }

            // 2️⃣ Inserta o actualiza el acceso
            var existing = await _ctx.PortalAccesos
                .FirstOrDefaultAsync(a => a.TokenConsulta == tokenConsulta);

            if (existing == null)
            {
                var acceso = new PortalAcceso
                {
                    IdPortalPersona = persona.IdPortalPersona,
                    TokenConsulta = tokenConsulta,
                    Tipo = Enum.Parse<AccesoTipo>(tipo, true),
                    IdEvento = idEvento,
                    IdInscripcion = idInscripcion,
                    IdInvitado = idInvitado,
                    GrupoId = grupoId,
                    TituloOverride = titulo,
                    Activo = true,
                    FechaAlta = DateTime.UtcNow
                };
                _ctx.PortalAccesos.Add(acceso);
                await _ctx.SaveChangesAsync();
            }

            // 3️⃣ Devuelve el token de la persona
            return persona.TokenPortal;
        }
        public async Task<RecuperarMiEventiaResponseDTO> RecuperarAccesoAsync(RecuperarMiEventiaRequestDTO req)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (string.IsNullOrWhiteSpace(req.email) && string.IsNullOrWhiteSpace(req.telefono))
                throw new Exception("Debe informar email o teléfono.");

            var emailNorm = req.email?.Trim().ToLower();
            var telNorm = req.telefono?.Trim();

            var persona = await _ctx.PortalPersonas
                .FirstOrDefaultAsync(x =>
                    x.Activo &&
                    (
                        (!string.IsNullOrEmpty(emailNorm) && x.Email != null && x.Email.ToLower() == emailNorm) ||
                        (!string.IsNullOrEmpty(telNorm) && x.Telefono == telNorm)
                    ));

            if (persona == null)
            {
                return new RecuperarMiEventiaResponseDTO
                {
                    ok = true,
                    mensaje = "Si encontramos un acceso asociado, enviaremos las instrucciones."
                };
            }

            var token = Guid.NewGuid().ToString("N");
            var codigo = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            var destino = !string.IsNullOrEmpty(emailNorm)
                ? emailNorm
                : telNorm!;

            _ctx.ef_portal_recuperacion_tokens.Add(new ef_portal_recuperacion_tokens
            {
                id_portal_persona = persona.IdPortalPersona,
                token_recuperacion = token,
                codigo = codigo,
                canal = req.canal,
                destino = destino,
                usado = false,
                fecha_expiracion = DateTimeOffset.UtcNow.AddMinutes(15),
                fecha_alta = DateTimeOffset.UtcNow
            });

            await _ctx.SaveChangesAsync();

            return new RecuperarMiEventiaResponseDTO
            {
                ok = true,
                mensaje = "Si encontramos un acceso asociado, enviaremos las instrucciones.",
                token_recuperacion = token // quitar en producción si no quieren exponerlo
            };
        }

        public async Task<ValidarRecuperacionResponseDTO> ValidarRecuperacionAsync(ValidarRecuperacionRequestDTO req)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (string.IsNullOrWhiteSpace(req.token_recuperacion))
                throw new Exception("token_recuperacion obligatorio.");

            var rec = await _ctx.ef_portal_recuperacion_tokens
                .FirstOrDefaultAsync(x =>
                    x.token_recuperacion == req.token_recuperacion &&
                    !x.usado &&
                    x.fecha_expiracion >= DateTimeOffset.UtcNow);

            if (rec == null)
                throw new Exception("Código inválido o vencido.");

            if (!string.IsNullOrWhiteSpace(rec.codigo))
            {
                if (string.IsNullOrWhiteSpace(req.codigo) || rec.codigo != req.codigo)
                    throw new Exception("Código inválido.");
            }

            var persona = await _ctx.PortalPersonas
                .FirstOrDefaultAsync(x => x.IdPortalPersona == rec.id_portal_persona && x.Activo);

            if (persona == null)
                throw new Exception("Acceso inválido.");

            rec.usado = true;
            rec.fecha_uso = DateTimeOffset.UtcNow;

            await _ctx.SaveChangesAsync();

            return new ValidarRecuperacionResponseDTO
            {
                ok = true,
                token_portal = persona.TokenPortal.ToString(),
                url_mi_eventia = "/mi-eventia/" + persona.TokenPortal.ToString()
            };
        }
    }
}
