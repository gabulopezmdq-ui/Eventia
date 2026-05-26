using System;
using System.Threading.Tasks;
using API.DataSchema;
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
    }
}
