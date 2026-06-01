using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("relaciones_persona")]
public class relaciones_personaController : ControllerBase
{
    private readonly IRelacionesPersonaService _service;

    public relaciones_personaController(IRelacionesPersonaService service)
    {
        _service = service;
    }

    [HttpGet("combo")]
    public async Task<ActionResult<List<RelacionPersonaComboDTO>>> Combo(
        [FromQuery] int idIdioma,
        [FromQuery] string uso)
    {
        var result = await _service.ComboAsync(idIdioma, uso);
        return Ok(result);
    }
}