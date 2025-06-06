using API.DataSchema;
using API.DataSchema.DTO;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class MovimientosService : IMovimientosService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public MovimientosService(DataContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<SuplenteResultadoDTO?> BuscarSuplente(string numDoc)
        {
            if (string.IsNullOrWhiteSpace(numDoc))
                return null;

            var suplente = await _context.Set<MEC_MovimientosDetalle>()
                .AsNoTracking()
                .FirstOrDefaultAsync(md => md.NumDoc == numDoc && md.SitRevista == "21");

            if (suplente == null)
                return null;

            return new SuplenteResultadoDTO
            {
                Apellido = suplente.Apellido,
                Nombre = suplente.Nombre,
                SoloLectura = true
            };
        }
    }
}