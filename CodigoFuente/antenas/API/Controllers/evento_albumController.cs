using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using API.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("evento/{id_evento:long}/album")]
    public class evento_albumController : ControllerBase
    {
        private readonly IAlbumService _albumService;
        private readonly IFotocabinaService _fotocabinaService;
        private readonly IRankingService _rankingService;

        public evento_albumController(
            IAlbumService albumService,
            IFotocabinaService fotocabinaService,
            IRankingService rankingService)
        {
            _albumService = albumService;
            _fotocabinaService = fotocabinaService;
            _rankingService = rankingService;
        }

        #region Feed y Subida (Público)

        [HttpGet("feed")]
        public async Task<ActionResult<PagedResult<ef_evento_album_fotos>>> GetFeed(long id_evento, [FromQuery] AlbumFeedFilterDTO filter)
        {
            var result = await _albumService.GetFeedAsync(id_evento, filter);
            return Ok(result);
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ef_evento_album_fotos>> Upload(long id_evento, [FromForm] AlbumUploadDTO dto, [FromHeader(Name = "X-Device-Id")] string? device_id)
        {
            // Nota: id_invitado podría venir del token si el usuario está logueado como invitado
            long? id_invitado = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                // Intentar obtener id_invitado del token si aplica
            }

            var foto = await _albumService.UploadFotoAsync(id_evento, id_invitado, device_id, dto);
            return Ok(foto);
        }

        [HttpPost("foto/{id_foto:long}/like")]
        public async Task<IActionResult> Like(long id_evento, long id_foto, [FromBody] AlbumLikeDTO dto)
        {
            dto.id_foto = id_foto;
            await _albumService.RegistrarLikeAsync(dto);
            return Ok();
        }

        #endregion

        #region Moderación y Configuración (Admin)

        [Authorize]
        [HttpGet("config")]
        public async Task<ActionResult<ef_evento_album_config>> GetConfig(long id_evento)
        {
            var config = await _albumService.GetConfigAsync(id_evento);
            return Ok(config);
        }

        [Authorize]
        [HttpPut("config")]
        public async Task<IActionResult> UpdateConfig(long id_evento, [FromBody] AlbumConfigUpdateDTO dto)
        {
            await _albumService.UpdateConfigAsync(id_evento, dto);
            return Ok();
        }

        [Authorize]
        [HttpPost("moderar")]
        public async Task<IActionResult> Moderar(long id_evento, [FromBody] AlbumModeracionDTO dto)
        {
            long idUsuarioAdmin = User.GetUserId();
            await _albumService.ModerarFotoAsync(dto, idUsuarioAdmin);
            return Ok();
        }

        #endregion

        #region Fotocabina

        [HttpGet("fotocabina/overlays")]
        public async Task<ActionResult<List<ef_evento_album_overlays>>> GetOverlays(long id_evento)
        {
            var result = await _fotocabinaService.GetOverlaysAsync(id_evento);
            return Ok(result);
        }

        [HttpPost("fotocabina/registrar-uso")]
        public async Task<IActionResult> RegistrarUso(long id_evento, [FromBody] dynamic req)
        {
            // Implementación simplificada del registro de uso
            long id_overlay = req.id_overlay;
            long id_foto = req.id_foto;
            string? device_id = req.device_id;
            await _fotocabinaService.RegistrarUsoAsync(id_evento, id_overlay, id_foto, device_id, null);
            return Ok();
        }

        #endregion

        #region Rankings

        [HttpGet("rankings")]
        public async Task<ActionResult<List<ef_evento_album_rankings>>> GetRankings(long id_evento)
        {
            // Implementar en AlbumService o RankingService según convenga
            // Por ahora asumo que se listan desde la DB directamente o vía service
            return Ok(new List<ef_evento_album_rankings>());
        }

        [HttpPost("rankings/{id_ranking:long}/votar")]
        public async Task<IActionResult> Votar(long id_evento, long id_ranking, [FromBody] RankingVotoDTO dto)
        {
            dto.id_ranking = id_ranking;
            await _rankingService.VotarAsync(id_evento, dto);
            return Ok();
        }

        [HttpGet("rankings/{id_ranking:long}/resultados")]
        public async Task<ActionResult<List<RankingResultDTO>>> GetResultados(long id_ranking)
        {
            var result = await _rankingService.GetResultadosAsync(id_ranking);
            return Ok(result);
        }

        #endregion
    }
}
