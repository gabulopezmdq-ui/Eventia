using  API.DataSchema;
using  API.Services;
using API.Services.ImportacionMecanizada;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class RetencionesXMecanizadasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_RetencionesXMecanizadas> _serviceGenerico;
        private readonly IConsolidarMecanizadaService _consolidarMecanizadaService;

        public RetencionesXMecanizadasController(DataContext context, ILogger<MEC_RetencionesXMecanizadas> logger, ICRUDService<MEC_RetencionesXMecanizadas> serviceGenerico, IConsolidarMecanizadaService consolidarMecanizadaService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _consolidarMecanizadaService = consolidarMecanizadaService;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_RetencionesXMecanizadas>>> Get() //Trae los registros Vigentes = S
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_RetencionesXMecanizadas>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetByMec")]
        public async Task<ActionResult<IEnumerable<MEC_RetencionesXMecanizadas>>> GetByMEC([FromQuery] int idEstablecimiento, int idMecanizada)
        {
            var result = await _consolidarMecanizadaService.ObtenerRetencionesAsync(idEstablecimiento, idMecanizada);
            return Ok(result);
        }


        [HttpGet("GetAllN")]
        public async Task<ActionResult<IEnumerable<MEC_RetencionesXMecanizadas>>> GetAllVigente() //Trae TODOS los registros independientemente de que son Vigente S o N
        {
            return Ok(_serviceGenerico.GetAllVigente());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_RetencionesXMecanizadas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }


        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_RetencionesXMecanizadas retencionesXMecanizadas)
        {
            await _serviceGenerico.Add(retencionesXMecanizadas);
            return Ok(retencionesXMecanizadas);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_RetencionesXMecanizadas>> Update([FromBody] MEC_RetencionesXMecanizadas retencionesXMecanizadas)
        {
            await _serviceGenerico.Update(retencionesXMecanizadas);
            return Ok(retencionesXMecanizadas);
        }

    }
}
