using API.Services.Monedas;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class monedasController : ControllerBase
    {
        private readonly IMonedasService _service;

        public monedasController(IMonedasService service)
        {
            _service = service;
        }

        // GET /monedas/GetCombo?activo=true
        [HttpGet("GetCombo")]
        public async Task<ActionResult> GetCombo([FromQuery] bool? activo = true)
        {
            var result = await _service.GetComboAsync(activo);
            return Ok(result);
        }
    }
}