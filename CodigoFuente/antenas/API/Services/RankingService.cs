using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IRankingService
    {
        Task<ef_evento_album_rankings> CreateRankingAsync(long id_evento, RankingCreateDTO dto);
        Task VotarAsync(long id_evento, RankingVotoDTO dto);
        Task<List<RankingResultDTO>> GetResultadosAsync(long id_ranking);
        Task CerrarRankingAsync(long id_ranking);
    }

    public class RankingService : IRankingService
    {
        private readonly DataContext _context;

        public RankingService(DataContext context)
        {
            _context = context;
        }

        public async Task<ef_evento_album_rankings> CreateRankingAsync(long id_evento, RankingCreateDTO dto)
        {
            var ranking = new ef_evento_album_rankings
            {
                id_evento = id_evento,
                nombre = dto.nombre,
                modo = dto.modo,
                alcance = dto.alcance,
                id_tramo = dto.id_tramo,
                solo_origen = dto.solo_origen,
                solo_destacadas = dto.solo_destacadas,
                fecha_inicio = dto.fecha_inicio,
                fecha_fin = dto.fecha_fin,
                cantidad_ganadoras = dto.cantidad_ganadoras,
                activo = true
            };

            _context.ef_evento_album_rankings.Add(ranking);
            await _context.SaveChangesAsync();

            return ranking;
        }

        public async Task VotarAsync(long id_evento, RankingVotoDTO dto)
        {
            var ranking = await _context.ef_evento_album_rankings.FindAsync(dto.id_ranking);
            if (ranking == null || ranking.cerrado || !ranking.activo) 
                throw new Exception("El ranking no está disponible para votación.");

            // Validar si ya votó en este ranking con este dispositivo
            bool yaVoto = await _context.ef_evento_album_ranking_votos
                .AnyAsync(v => v.id_ranking == dto.id_ranking && v.device_id == dto.device_id);

            if (yaVoto) throw new Exception("Ya has registrado tu voto para este concurso.");

            var voto = new ef_evento_album_ranking_votos
            {
                id_ranking = dto.id_ranking,
                id_evento = id_evento,
                id_foto = dto.id_foto,
                device_id = dto.device_id,
                id_invitado = dto.id_invitado,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_album_ranking_votos.Add(voto);
            await _context.SaveChangesAsync();
        }

        public async Task<List<RankingResultDTO>> GetResultadosAsync(long id_ranking)
        {
            return await _context.ef_evento_album_ranking_votos
                .Where(v => v.id_ranking == id_ranking)
                .GroupBy(v => v.id_foto)
                .Select(g => new RankingResultDTO
                {
                    id_foto = g.Key,
                    votos_count = g.Count(),
                    url_publica = _context.ef_evento_album_fotos
                        .Where(f => f.id_foto == g.Key)
                        .Select(f => f.url_publica)
                        .FirstOrDefault(),
                    nombre_invitado = _context.ef_evento_album_fotos
                        .Where(f => f.id_foto == g.Key)
                        .Select(f => f.nombre_invitado)
                        .FirstOrDefault()
                })
                .OrderByDescending(r => r.votos_count)
                .ToListAsync();
        }

        public async Task CerrarRankingAsync(long id_ranking)
        {
            var ranking = await _context.ef_evento_album_rankings.FindAsync(id_ranking);
            if (ranking == null) throw new Exception("Ranking no encontrado");

            ranking.cerrado = true;
            
            // Opcional: Calcular y setear la foto ganadora principal
            var resultados = await GetResultadosAsync(id_ranking);
            if (resultados.Any())
            {
                ranking.id_foto_ganadora = resultados.First().id_foto;
            }

            await _context.SaveChangesAsync();
        }
    }
}
