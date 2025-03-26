using API.DataSchema;
using API.Services;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class TMPErroresController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TMPErroresCarRevista> _carRevista;
        private readonly ICRUDService<MEC_TMPErroresConceptos> _concepto;
        private readonly ICRUDService<MEC_TMPErroresEstablecimientos> _establecimiento;
        private readonly ICRUDService<MEC_TMPErroresFuncion> _funcion;
        private readonly ICRUDService<MEC_TMPErroresMecanizadas> _mecanizada;
        private readonly ICRUDService<MEC_TMPErroresTiposEstablecimientos> _tiposEstablecimiento;

        public TMPErroresController(DataContext context, ILogger<MEC_Establecimientos> logger, ICRUDService<MEC_TMPErroresCarRevista> carRevista, 
                                    ICRUDService<MEC_TMPErroresConceptos> concepto, ICRUDService<MEC_TMPErroresEstablecimientos> establecimiento,
                                    ICRUDService<MEC_TMPErroresFuncion> funcion, ICRUDService<MEC_TMPErroresMecanizadas> mecanizada, 
                                    ICRUDService<MEC_TMPErroresTiposEstablecimientos> tiposEstablecimientos)
        {
            _context = context;
            _carRevista = carRevista;
            _concepto = concepto;
            _establecimiento = establecimiento;
            _funcion = funcion;
            _mecanizada = mecanizada;
            _tiposEstablecimiento = tiposEstablecimientos;
        }
        
        [HttpGet("GetAllCarRevista")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresCarRevista>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_carRevista.GetAll());
        }

        [HttpGet("GetAllConceptos")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresConceptos>>> GetErroresConceptos() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_concepto.GetAll());
        }

        [HttpGet("GetAllEstablecimientos")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresEstablecimientos>>> GetErroresEst() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_establecimiento.GetAll());
        }

        [HttpGet("GetAllFunciones")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresFuncion>>> GetErroresFunciones() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_funcion  .GetAll());
        }

        [HttpGet("GetAllMecanizadas")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresMecanizadas>>> GetErroresMec()
        {
            return Ok(_mecanizada.GetAll().ToList()); //trae todos los registros. De la forma anterior generaba un problema por el volumen de la solicitud
        
        }

        [HttpGet("GetAllTipoEst")]
        public async Task<ActionResult<IEnumerable<MEC_TMPErroresTiposEstablecimientos>>> GetErroresTipoEst() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_tiposEstablecimiento.GetAll());
        }





    }
}
