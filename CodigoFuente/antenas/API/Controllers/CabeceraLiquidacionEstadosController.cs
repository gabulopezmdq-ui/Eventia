using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class CabeceraLiquidacionEstadosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_CabeceraLiquidacionEstados> _serviceGenerico;
        private readonly IUserService _userService;

        public CabeceraLiquidacionEstadosController(DataContext context, ILogger<MEC_CabeceraLiquidacionEstados> logger, ICRUDService<MEC_CabeceraLiquidacionEstados> serviceGenerico, IUserService userService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _userService = userService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacionEstados>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_CabeceraLiquidacionEstados>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

    }
}
