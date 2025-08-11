using API.DataSchema;
using API.DataSchema.DTO;
using DocumentFormat.OpenXml.Office2013.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class AprobarInasistenciasService : IAprobarInasistenciasService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AprobarInasistenciasService(DataContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }


        public async Task<List<MEC_InasistenciasDetalle>> ObtenerDetallesPendientes()
        {
            var resultados = await _context.MEC_InasistenciasDetalle.Where(m => m.EstadoRegistro == "P").ToListAsync();

            return resultados;
        }

        public async Task<bool> AceptarInas (int idInasDetalle)
        {
            var userId = GetUserIdFromToken();
            var inasistencia = await _context.MEC_InasistenciasDetalle.FirstOrDefaultAsync(m => m.IdInasistenciasDetalle == idInasDetalle);

            if (inasistencia == null)
                return false;

            inasistencia.EstadoRegistro = "A";
            inasistencia.IdUsuario = userId;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RechazarInas (int idInasDetalle, string observaciones)
        {
            var userId = GetUserIdFromToken();
            var inasistencia = await _context.MEC_InasistenciasDetalle.FirstOrDefaultAsync(m => m.IdInasistenciasDetalle == idInasDetalle);

            if (inasistencia == null)
                return false;

            inasistencia.EstadoRegistro = "R";
            inasistencia.MotivoRechazo = observaciones;
            inasistencia.IdUsuario = userId;

            await _context.SaveChangesAsync();
            return true;

        }

        public async Task<bool> AgregarDetalle (MEC_InasistenciasDetalle detalle)
        {
            var userId = GetUserIdFromToken();
            detalle.IdUsuario = userId;
            _context.MEC_InasistenciasDetalle.Add(detalle);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MEC_InasistenciasDetalle>> ObtenerInasEduc(int idInasistenciaCabecera)
        {
            var resultados = await _context.MEC_InasistenciasDetalle.Where(m => m.IdInasistenciaCabecera == idInasistenciaCabecera && m.EstadoRegistro == "A").ToListAsync();

            return resultados;
        }

        public async Task<bool> EnviarInas (List<int> idInasistencias)
        {
            var inasistencias = await _context.MEC_InasistenciasDetalle.Where(i => idInasistencias.Contains(i.IdInasistenciasDetalle)).ToListAsync();

            if (inasistencias == null || !inasistencias.Any())
                return false;

            foreach (var i in inasistencias)
            {
                i.EstadoRegistro = "E";
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EnviarEduc(int idCabecera, string observaciones)
        {
            var userId = GetUserIdFromToken();

            var cabecera = await _context.MEC_InasistenciasCabecera.FirstOrDefaultAsync(c => c.IdInasistenciaCabecera == idCabecera);

            if(cabecera == null)
                return false;

            cabecera.Observaciones = observaciones;
            cabecera.Estado = "E";
            cabecera.FechaEntrega = DateTime.Now;
            cabecera.Confecciono = userId;

            bool tieneDetalles = await _context.MEC_InasistenciasDetalle.AnyAsync(d => d.IdInasistenciaCabecera == idCabecera);

            if (!tieneDetalles)
            {
                cabecera.SinNovedades = "S";
            }

            await _context.SaveChangesAsync();
            return true;
        }


        private int GetUserIdFromToken()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
            {
                throw new InvalidOperationException("Claim 'id' no encontrada en el token.");
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new InvalidOperationException("El valor de la claim 'id' no es un número válido.");
            }

            return userId;
        }

    }
}