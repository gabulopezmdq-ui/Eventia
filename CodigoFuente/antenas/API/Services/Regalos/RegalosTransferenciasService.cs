using API.DataSchema;
using API.DataSchema.DTO.Regalos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Regalos
{
    public class RegalosTransferenciasService : IRegalosTransferenciasService
    {
        private readonly DataContext _context;

        public RegalosTransferenciasService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<RegalosTransferenciaDTO>> ListarAsync(long id_evento, bool? activo = true)
        {
            var q = _context.ef_evento_regalos_transferencias
                .AsNoTracking()
                .Where(x => x.id_evento == id_evento);

            if (activo.HasValue)
                q = q.Where(x => x.activo == activo.Value);

            var list = await q
                .OrderBy(x => x.orden)
                .ThenBy(x => x.codigo_moneda)
                .ThenBy(x => x.id_evento_regalo_transferencia)
                .ToListAsync();

            return list.Select(x => new RegalosTransferenciaDTO
            {
                id_evento_regalo_transferencia = x.id_evento_regalo_transferencia,
                id_evento = x.id_evento,
                codigo_moneda = x.codigo_moneda,
                titulo = x.titulo,
                datos_transferencia_texto = x.datos_transferencia_texto,
                instrucciones = x.instrucciones,
                orden = x.orden,
                activo = x.activo
            }).ToList();
        }

        public async Task<RegalosTransferenciaDTO> UpsertAsync(RegalosTransferenciaUpsertDTO dto)
        {
            if (dto == null) throw new Exception("Body inválido.");
            if (dto.id_evento <= 0) throw new Exception("id_evento inválido.");
            if (string.IsNullOrWhiteSpace(dto.codigo_moneda)) throw new Exception("codigo_moneda obligatorio.");
            if (string.IsNullOrWhiteSpace(dto.datos_transferencia_texto)) throw new Exception("datos_transferencia_texto obligatorio.");

            string moneda = dto.codigo_moneda.Trim().ToUpper();

            bool monedaOk = await _context.ef_monedas.AsNoTracking()
                .AnyAsync(m => m.codigo_moneda == moneda && m.activo == true);

            if (!monedaOk) throw new Exception("Moneda inexistente o inactiva.");

            ef_evento_regalos_transferencias? entity = null;

            if (dto.id_evento_regalo_transferencia.HasValue)
            {
                entity = await _context.ef_evento_regalos_transferencias
                    .FirstOrDefaultAsync(x => x.id_evento == dto.id_evento
                                           && x.id_evento_regalo_transferencia == dto.id_evento_regalo_transferencia.Value);

                if (entity == null) throw new Exception("Registro no encontrado.");
            }
            else
            {
                entity = new ef_evento_regalos_transferencias
                {
                    id_evento = dto.id_evento,
                    fecha_alta = DateTimeOffset.UtcNow,
                    activo = true
                };
                _context.ef_evento_regalos_transferencias.Add(entity);
            }

            entity.codigo_moneda = moneda;
            entity.titulo = dto.titulo?.Trim();
            entity.datos_transferencia_texto = dto.datos_transferencia_texto.Trim();
            entity.instrucciones = dto.instrucciones?.Trim();
            entity.orden = dto.orden;
            entity.activo = dto.activo;
            entity.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new RegalosTransferenciaDTO
            {
                id_evento_regalo_transferencia = entity.id_evento_regalo_transferencia,
                id_evento = entity.id_evento,
                codigo_moneda = entity.codigo_moneda,
                titulo = entity.titulo,
                datos_transferencia_texto = entity.datos_transferencia_texto,
                instrucciones = entity.instrucciones,
                orden = entity.orden,
                activo = entity.activo
            };
        }

        public async Task<bool> SetActivoAsync(long id_evento, long id_evento_regalo_transferencia, bool activo)
        {
            var entity = await _context.ef_evento_regalos_transferencias
                .FirstOrDefaultAsync(x => x.id_evento == id_evento
                                       && x.id_evento_regalo_transferencia == id_evento_regalo_transferencia);

            if (entity == null) return false;

            entity.activo = activo;
            entity.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}