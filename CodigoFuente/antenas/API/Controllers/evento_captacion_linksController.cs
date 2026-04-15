using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class evento_captacion_linksController : ControllerBase
    {
        private readonly IEventoCaptacionLinksService _service;

        public evento_captacion_linksController(IEventoCaptacionLinksService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("by-evento")]
        public async Task<ActionResult<List<EventoCaptacionLinkDTO>>> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            var result = await _service.GetByEventoAsync(idUsuario, idEvento);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idAccesoLink:long}")]
        public async Task<ActionResult<EventoCaptacionLinkDTO>> GetById(long idAccesoLink)
        {
            long idUsuario = User.GetUserId();
            var result = await _service.GetByIdAsync(idUsuario, idAccesoLink);
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<EventoCaptacionLinkDTO>> Upsert([FromQuery] long idEvento, [FromBody] EventoCaptacionLinkUpsertRequest req)
        {
            long idUsuario = User.GetUserId();
            var result = await _service.UpsertAsync(idUsuario, idEvento, req);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{idAccesoLink:long}/activo")]
        public async Task<IActionResult> SetActivo([FromRoute] long idAccesoLink, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();
            var result = await _service.SetActivoAsync(idUsuario, idAccesoLink, activo);
            return Ok(result);
        }
    }
}