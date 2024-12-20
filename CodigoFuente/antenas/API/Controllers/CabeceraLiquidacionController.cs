using  API.DataSchema;
using  API.Services;
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
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class CabeceraLiquidacionController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_CabeceraLiquidacion> _serviceGenerico;
        private readonly IUserService _userService;

        public CabeceraLiquidacionController(DataContext context, ILogger<MEC_CabeceraLiquidacion> logger, ICRUDService<MEC_CabeceraLiquidacion> serviceGenerico, IUserService userService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _userService = userService;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacion>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_CabeceraLiquidacion>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<MEC_CabeceraLiquidacion>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_CabeceraLiquidacion cab)
        {

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            cab.IdUsuario = int.Parse(userIdClaim.Value);

            await _serviceGenerico.Add(cab);
            return Ok(cab);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_CabeceraLiquidacion>> Update([FromBody] MEC_CabeceraLiquidacion cab)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            cab.IdUsuario = int.Parse(userIdClaim.Value);
            await _serviceGenerico.Update(cab);
            return Ok(cab);
        }

    }
}
