using System;
using System.Security.Claims;

namespace API.Security
{
    public static class ClaimsExtensions
    {
        public static long GetUserId(this ClaimsPrincipal user)
        {
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? user.FindFirstValue("sub"); // fallback JWT estándar

            if (!long.TryParse(id, out var idUsuario))
                throw new UnauthorizedAccessException(
                    "Token inválido: no se pudo obtener el id del usuario.");

            return idUsuario;
        }
    }
}

