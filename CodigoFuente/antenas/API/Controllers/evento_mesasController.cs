using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize]
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_mesasController : ControllerBase
    {
        private readonly IMesasService _mesasService;

        public evento_mesasController(IMesasService mesasService)
        {
            _mesasService = mesasService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(MesaCreateDTO dto)
        {
            try
            {
                var mesa = await _mesasService.CrearMesaAsync(dto);
                return Ok(mesa);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("ByTramo/{idTramo}")]
        public async Task<IActionResult> GetByTramo(long idTramo)
        {
            var mesas = await _mesasService.GetMesasByTramoAsync(idTramo);
            return Ok(mesas);
        }

        [HttpGet("Disponibles/{idTramo}")]
        public async Task<IActionResult> GetInvitadosDisponibles(long idTramo)
        {
            try
            {
                var disponibles = await _mesasService.GetInvitadosDisponiblesParaTramoAsync(idTramo);
                return Ok(disponibles);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("AsignarInvitado")]
        public async Task<IActionResult> AsignarInvitado(MesaAsignarInvitadoDTO dto)
        {
            try
            {
                await _mesasService.AsignarInvitadoAMesaAsync(dto);
                return Ok(new { message = "Invitado asignado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{idMesa}/Invitados")]
        public async Task<IActionResult> GetInvitados(long idMesa)
        {
            var invitadosMesa = await _mesasService.GetInvitadosByMesaAsync(idMesa);
            return Ok(invitadosMesa);
        }

        [HttpDelete("QuitarInvitado")]
        public async Task<IActionResult> QuitarInvitado(long idMesa, long idInvitado)
        {
            try
            {
                await _mesasService.QuitarInvitadoDeMesaAsync(idMesa, idInvitado);
                return Ok(new { message = "Invitado quitado de la mesa" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

}
