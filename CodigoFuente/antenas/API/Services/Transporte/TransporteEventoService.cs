using API.DataSchema;
using API.DataSchema.DTO.Transporte;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace API.Services.Transporte
{
    public class TransporteEventoService : ITransporteEventoService
    {
        private readonly DataContext _context;

        public TransporteEventoService(DataContext context)
        {
            _context = context;
        }

        public async Task<TransporteEventoDTO> GetByEventoAsync(long id_evento)
        {
            if (id_evento <= 0) throw new Exception("Id de evento inválido.");

            // Validar que el evento exista
            var existeEvento = await _context.ef_eventos.AnyAsync(x => x.id_evento == id_evento);
            if (!existeEvento) throw new Exception("Evento inexistente.");

            var row = await _context.ef_evento_transporte
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            // Si no existe, devolvemos un DTO vacío (sin crear registro todavía)
            if (row == null)
            {
                return new TransporteEventoDTO
                {
                    id_evento = id_evento,
                    info_publica = null,
                    activo = true,
                    fecha_modif = null
                };
            }

            return new TransporteEventoDTO
            {
                id_evento = row.id_evento,
                info_publica = row.info_publica,
                activo = row.activo,
                fecha_modif = row.fecha_modif
            };
        }

        public async Task<TransporteEventoDTO> UpsertAsync(long id_evento, TransporteEventoUpsertRequest req)
        {
            if (req == null) throw new Exception("Body inválido.");
            if (id_evento <= 0) throw new Exception("Id de evento inválido.");

            var evento = await _context.ef_eventos.FindAsync(id_evento);
            if (evento == null) throw new Exception("Evento inexistente.");

            var row = await _context.ef_evento_transporte
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (row == null)
            {
                row = new ef_evento_transporte
                {
                    id_evento = id_evento,
                    info_publica = req.info_publica,
                    activo = req.activo,
                    fecha_alta = DateTimeOffset.UtcNow,
                    fecha_modif = DateTimeOffset.UtcNow
                };

                _context.ef_evento_transporte.Add(row);
            }
            else
            {
                row.info_publica = req.info_publica;
                row.activo = req.activo;
                row.fecha_modif = DateTimeOffset.UtcNow;

                _context.ef_evento_transporte.Update(row);
            }

            await _context.SaveChangesAsync();

            return new TransporteEventoDTO
            {
                id_evento = row.id_evento,
                info_publica = row.info_publica,
                activo = row.activo,
                fecha_modif = row.fecha_modif
            };
        }
    }
}