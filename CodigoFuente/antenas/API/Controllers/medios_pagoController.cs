using API.DataSchema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class medios_pagoController : ControllerBase
    {
        private readonly DataContext _context;

        public medios_pagoController(DataContext context)
        {
            _context = context;
        }

        // GET /medios_pago/GetAll?idIdioma=1&soloActivos=true
        [HttpGet("GetAll")]
        public async Task<ActionResult<List<MedioPagoDTO>>> GetAll(
            [FromQuery] short idIdioma = 1,
            [FromQuery] bool soloActivos = true)
        {
            var query =
                from mp in _context.ef_param_medios_pago.AsNoTracking()
                join tr in _context.ef_param_traducciones.AsNoTracking()
                    on new
                    {
                        entidad = "MEDIO_PAGO",
                        id_item = (long)mp.id_medio_pago,
                        id_idioma = idIdioma,
                        activo = true
                    }
                    equals new
                    {
                        entidad = tr.entidad,
                        id_item = tr.id_item,
                        id_idioma = tr.id_idioma,
                        activo = tr.activo
                    }
                    into trJ
                from tr in trJ.DefaultIfEmpty()
                join trEs in _context.ef_param_traducciones.AsNoTracking()
                    on new
                    {
                        entidad = "MEDIO_PAGO",
                        id_item = (long)mp.id_medio_pago,
                        id_idioma = (short)1,
                        activo = true
                    }
                    equals new
                    {
                        entidad = trEs.entidad,
                        id_item = trEs.id_item,
                        id_idioma = trEs.id_idioma,
                        activo = trEs.activo
                    }
                    into trEsJ
                from trEs in trEsJ.DefaultIfEmpty()
                where !soloActivos || mp.activo
                orderby mp.orden, mp.codigo
                select new MedioPagoDTO
                {
                    id_medio_pago = mp.id_medio_pago,
                    codigo = mp.codigo,
                    texto = tr != null ? tr.texto : (trEs != null ? trEs.texto : mp.codigo),
                    orden = mp.orden,
                    activo = mp.activo,
                    permite_referencia = mp.permite_referencia,
                    es_internacional = mp.es_internacional
                };

            return Ok(await query.ToListAsync());
        }
    }

    public class MedioPagoDTO
    {
        public short id_medio_pago { get; set; }
        public string codigo { get; set; } = null!;
        public string texto { get; set; } = null!;
        public short orden { get; set; }
        public bool activo { get; set; }
        public bool permite_referencia { get; set; }
        public bool es_internacional { get; set; }
    }
}