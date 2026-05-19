using API.DataSchema;
using API.DataSchema.DTO.Regalos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace API.Services.Regalos
{
    public class RegalosTransferenciasConfigService : IRegalosTransferenciasConfigService
    {
        private readonly DataContext _context;

        public RegalosTransferenciasConfigService(DataContext context)
        {
            _context = context;
        }

        public async Task<RegalosTransferenciasConfigDTO> GetAsync(long id_evento)
        {
            var cfg = await _context.ef_evento_regalos_transferencias_config
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (cfg == null)
            {
                // Default lógico: si no existe, devolvemos default sin insert (para no ensuciar DB)
                return new RegalosTransferenciasConfigDTO
                {
                    id_evento = id_evento,
                    titulo = "Regalos",
                    texto_intro = null,
                    activo = true
                };
            }

            return new RegalosTransferenciasConfigDTO
            {
                id_evento = cfg.id_evento,
                titulo = cfg.titulo,
                texto_intro = cfg.texto_intro,
                activo = cfg.activo
            };
        }

        public async Task<RegalosTransferenciasConfigDTO> UpsertAsync(long id_evento, RegalosTransferenciasConfigUpsertDTO dto)
        {
            if (dto == null) throw new Exception("Body inválido.");
            if (id_evento <= 0) throw new Exception("id_evento inválido.");
            if (string.IsNullOrWhiteSpace(dto.titulo)) dto.titulo = "Regalos";

            var cfg = await _context.ef_evento_regalos_transferencias_config
                .FirstOrDefaultAsync(x => x.id_evento == id_evento);

            if (cfg == null)
            {
                cfg = new ef_evento_regalos_transferencias_config
                {
                    id_evento = id_evento,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.ef_evento_regalos_transferencias_config.Add(cfg);
            }

            cfg.titulo = dto.titulo.Trim();
            cfg.texto_intro = dto.texto_intro?.Trim();
            cfg.activo = dto.activo;
            cfg.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new RegalosTransferenciasConfigDTO
            {
                id_evento = cfg.id_evento,
                titulo = cfg.titulo,
                texto_intro = cfg.texto_intro,
                activo = cfg.activo
            };
        }
    }
}