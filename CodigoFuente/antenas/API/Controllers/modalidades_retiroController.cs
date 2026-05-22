using API.DataSchema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("modalidades_retiro")]
    public class modalidades_retiroController : ControllerBase
    {
        private readonly DataContext _context;

        public modalidades_retiroController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ModalidadRetiroDTO>>> GetAll([FromQuery] short idIdioma = 1)
        {
            var baseItems = new List<ModalidadRetiroDTO>
            {
                new ModalidadRetiroDTO { IdItem = 1, Codigo = "SE_RETIRA_SOLO", Orden = 1, Texto = "Se retira solo/a" },
                new ModalidadRetiroDTO { IdItem = 2, Codigo = "REQUIERE_AUTORIZADO", Orden = 2, Texto = "Lo retira una persona autorizada" },
                new ModalidadRetiroDTO { IdItem = 3, Codigo = "NO_APLICA", Orden = 3, Texto = "No aplica" }
            };

            var traducciones = await _context.Set<ef_param_traducciones>()
                .AsNoTracking()
                .Where(x =>
                    x.entidad == "MODALIDAD_RETIRO" &&
                    x.id_idioma == idIdioma &&
                    x.activo == true)
                .ToListAsync();

            foreach (var item in baseItems)
            {
                var traduccion = traducciones.FirstOrDefault(x => x.id_item == item.IdItem);

                if (traduccion != null)
                    item.Texto = traduccion.texto;
            }

            return Ok(baseItems.OrderBy(x => x.Orden).ToList());
        }
    }

    public class ModalidadRetiroDTO
    {
        public int IdItem { get; set; }
        public string Codigo { get; set; } = "";
        public string Texto { get; set; } = "";
        public int Orden { get; set; }
    }
}