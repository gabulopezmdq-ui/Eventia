using API.DataSchema.DTO.EventiaLive;
using API.Services.EventiaLive;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class evento_liveController : ControllerBase
    {
        private readonly IEventoLiveService _service;

        public evento_liveController(IEventoLiveService service)
        {
            _service = service;
        }

        [HttpGet("GetByEvento")]
        public async Task<IActionResult> GetByEvento([FromQuery] long idEvento)
        {
            try
            {
                var result = await _service.GetByEventoAsync(idEvento);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> Crear([FromBody] LiveCrearRequestDTO req)
        {
            try
            {
                var id = await _service.CrearAsync(req);
                return Ok(new { ok = true, id_dinamica = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPut("Editar/{idDinamica}")]
        public async Task<IActionResult> Editar(long idDinamica, [FromBody] LiveEditarRequestDTO req)
        {
            try
            {
                await _service.EditarAsync(idDinamica, req);
                return Ok(new { ok = true, id_dinamica = idDinamica });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPut("CambiarEstado/{idDinamica}")]
        public async Task<IActionResult> CambiarEstado(long idDinamica, [FromBody] LiveCambiarEstadoRequestDTO req)
        {
            try
            {
                var estado = await _service.CambiarEstadoAsync(idDinamica, req);
                return Ok(new { ok = true, id_dinamica = idDinamica, estado });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("Votar")]
        public async Task<IActionResult> Votar([FromBody] LiveVotarRequestDTO req)
        {
            try
            {
                var id = await _service.VotarAsync(req);
                return Ok(new { ok = true, id_respuesta = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("MarcarCorrectaYCalcularGanadores")]
        public async Task<IActionResult> MarcarCorrectaYCalcularGanadores([FromBody] LiveCalcularGanadoresRequestDTO req)
        {
            try
            {
                var result = await _service.MarcarCorrectaYCalcularGanadoresAsync(req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpGet("Ganadores")]
        public async Task<IActionResult> Ganadores([FromQuery] long idDinamica)
        {
            try
            {
                var result = await _service.GetGanadoresAsync(idDinamica);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPut("GanadorEstado/{idGanador}")]
        public async Task<IActionResult> GanadorEstado(long idGanador, [FromBody] LiveGanadorEstadoRequestDTO req)
        {
            try
            {
                await _service.CambiarEstadoGanadorAsync(idGanador, req);
                return Ok(new { ok = true, id_ganador = idGanador });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpGet("Premios")]
        public async Task<IActionResult> Premios([FromQuery] long idDinamica)
        {
            try
            {
                var result = await _service.GetPremiosAsync(idDinamica);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("Premio")]
        public async Task<IActionResult> Premio([FromBody] LivePremioUpsertRequestDTO req)
        {
            try
            {
                var id = await _service.UpsertPremioAsync(req);
                return Ok(new { ok = true, id_premio = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("CanjearPremio")]
        public async Task<IActionResult> CanjearPremio([FromBody] LiveCanjearPremioRequestDTO req)
        {
            try
            {
                var result = await _service.CanjearPremioAsync(req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpGet("PremioPorQr/{qrToken}")]
        public async Task<IActionResult> PremioPorQr(string qrToken)
        {
            try
            {
                var result = await _service.GetPremioPorQrAsync(qrToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ok = false, message = ex.Message });
            }
        }

        [HttpPost("Duplicar")]
        public async Task<IActionResult> Duplicar([FromBody] LiveDuplicarRequestDTO req)
        {
            try
            {
                var idNueva = await _service.DuplicarAsync(req);

                return Ok(new
                {
                    ok = true,
                    id_dinamica = idNueva
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    ok = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("FinalizarSinCorrecta")]
        public async Task<IActionResult> FinalizarSinCorrecta([FromBody] LiveFinalizarSinCorrectaRequestDTO req)
        {
            try
            {
                var result = await _service.FinalizarSinCorrectaAsync(req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    ok = false,
                    message = ex.Message
                });
            }
        }






    }
}