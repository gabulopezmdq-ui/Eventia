using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features.Sections;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class ResumenPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "RESUMEN";

        public ResumenPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            return await (
                from e in _context.ef_eventos.AsNoTracking()
                join dc0 in _context.ef_dress_code.AsNoTracking()
                    on e.id_dress_code equals dc0.id_dress_code into gjDc
                from dc in gjDc.DefaultIfEmpty()
                where e.id_evento == context.IdEvento
                select new
                {
                    id_evento = e.id_evento,
                    tipo_portal = context.TipoPortal,
                    titulo = e.anfitriones_texto,
                    saludo = e.saludo,
                    mensaje_bienvenida = e.mensaje_bienvenida,
                    fecha_evento = e.fecha_evento,
                    fecha_inicio = e.fecha_inicio,
                    fecha_fin = e.fecha_fin,
                    tipo_operacion = e.tipo_operacion,
                    dress_code_codigo = dc != null ? dc.codigo : null,
                    dress_code_descripcion = e.dress_code_descripcion,
                    usuario = new
                    {
                        nombre = context.UsuarioNombre,
                        email = context.UsuarioEmail
                    }
                }
            ).FirstOrDefaultAsync();
        }
    }
}