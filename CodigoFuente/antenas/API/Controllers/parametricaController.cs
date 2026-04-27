using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class parametricaController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IParametricaService _parametricaService;

        public parametricaController(DataContext context, IParametricaService parametricaService)
        {
            _context = context;
            _parametricaService = parametricaService;
        }

        private async Task<short?> GetIdiomaEvento(long idEvento)
        {
            return await _context.ef_eventos
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .Select(x => (short?)x.id_idioma)
                .SingleOrDefaultAsync();
        }

        [HttpGet("TiposBeneficioRegistro")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetTiposBeneficioRegistro([FromQuery] long idEvento)
        {
            var idIdioma = await GetIdiomaEvento(idEvento);
            if (!idIdioma.HasValue)
                return NotFound("Evento inexistente.");

            return Ok(await _parametricaService.GetTiposBeneficioRegistroAsync(idIdioma.Value));
        }

        [HttpGet("PerfilesAsistencia")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetPerfilesAsistencia([FromQuery] long idEvento)
        {
            var idIdioma = await GetIdiomaEvento(idEvento);
            if (!idIdioma.HasValue)
                return NotFound("Evento inexistente.");

            return Ok(await _parametricaService.GetPerfilesAsistenciaAsync(idIdioma.Value));
        }

        [HttpGet("InteresesEventoPublico")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetInteresesEventoPublico([FromQuery] long idEvento)
        {
            var idIdioma = await GetIdiomaEvento(idEvento);
            if (!idIdioma.HasValue)
                return NotFound("Evento inexistente.");

            return Ok(await _parametricaService.GetInteresesEventoPublicoAsync(idIdioma.Value));
        }

        [HttpGet("PreferenciasMusicales")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetPreferenciasMusicales([FromQuery] long idEvento)
        {
            var idIdioma = await GetIdiomaEvento(idEvento);
            if (!idIdioma.HasValue)
                return NotFound("Evento inexistente.");

            return Ok(await _parametricaService.GetPreferenciasMusicalesAsync(idIdioma.Value));
        }
        
        [HttpGet("RestriccionesAlimentarias")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetRestriccionesAlimentarias()
        {
            // Idioma por defecto (1 = Español)
            short idIdioma = 1;

            return Ok(await _parametricaService.GetRestriccionesAlimentariasAsync(idIdioma));
        }
    }
}