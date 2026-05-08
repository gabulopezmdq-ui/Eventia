using API.DataSchema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class param_traduccionesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<param_traduccionesController> _logger;

        public param_traduccionesController(DataContext context, ILogger<param_traduccionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =========================
        // DTOs
        // =========================
        public class ParamTraduccionDTO
        {
            public long id_param_traduccion { get; set; }
            public string entidad { get; set; } = null!;
            public long id_item { get; set; }
            public short id_idioma { get; set; }

            public string locale { get; set; } = null!;
            public string nombre_largo { get; set; } = null!;

            public string texto { get; set; } = null!;
            public short? orden { get; set; }
            public bool activo { get; set; }
        }

        public class ParamTraduccionUpsertItem
        {
            public short id_idioma { get; set; }
            public string texto { get; set; } = "";
            public short? orden { get; set; }
            public bool activo { get; set; } = true;
        }

        public class ParamTraduccionUpsertBatchRequest
        {
            public string entidad { get; set; } = null!;
            public long id_item { get; set; }
            public List<ParamTraduccionUpsertItem> items { get; set; } = new();
        }

        // =========================
        // Helpers
        // =========================
        private static string NormalizeEntidad(string entidad)
            => (entidad ?? "").Trim().ToUpperInvariant();

        private static string NormalizeTexto(string texto)
            => (texto ?? "").Trim();

        private async Task<ef_param_entidades?> GetEntidadConfigAsync(string entidadNorm)
        {
            return await _context.ef_param_entidades
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.entidad == entidadNorm && x.activo);
        }

        private static bool IsValidLocaleFormat(string locale)
        {
            // muy básico (xx-YY). Si querés ser estricto, metemos regex.
            if (string.IsNullOrWhiteSpace(locale)) return false;
            if (locale.Length < 4 || locale.Length > 10) return false;
            return locale.Contains("-");
        }

        // Si querés, podés validar existencia del "id_item" contra tabla base.
        // Hoy no lo hago genérico para evitar SQL dinámico: se garantiza por UI/uso.
        // =========================

        // ==========================================
        // 1) GET grilla de traducciones por item
        // ==========================================
        // GET /param_traducciones/GetByEntidadItem?entidad=TIPO_EVENTO&idItem=1
        [HttpGet("GetByEntidadItem")]
        public async Task<ActionResult<List<ParamTraduccionDTO>>> GetByEntidadItem(
            [FromQuery] string entidad,
            [FromQuery] long idItem)
        {
            var ent = NormalizeEntidad(entidad);
            if (string.IsNullOrWhiteSpace(ent)) return BadRequest("entidad es requerida.");
            if (idItem <= 0) return BadRequest("idItem es requerido.");

            var entCfg = await GetEntidadConfigAsync(ent);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            var data = await (
                from t in _context.ef_param_traducciones
                join i in _context.ef_idiomas on t.id_idioma equals i.id_idioma
                where t.entidad == ent && t.id_item == idItem
                orderby (t.orden ?? 999), i.locale
                select new ParamTraduccionDTO
                {
                    id_param_traduccion = t.id_param_traduccion,
                    entidad = t.entidad,
                    id_item = t.id_item,
                    id_idioma = t.id_idioma,
                    locale = i.locale,
                    nombre_largo = i.nombre_largo,
                    texto = t.texto,
                    orden = t.orden,
                    activo = t.activo
                }
            ).ToListAsync();

            return Ok(data);
        }

        // ==========================================
        // 2) POST: crear una traducción
        // ==========================================
        // POST /param_traducciones
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_param_traducciones model)
        {
            if (model == null) return BadRequest();

            model.entidad = NormalizeEntidad(model.entidad);
            if (string.IsNullOrWhiteSpace(model.entidad)) return BadRequest("entidad es requerida.");
            if (model.id_item <= 0) return BadRequest("id_item es requerido.");
            if (model.id_idioma <= 0) return BadRequest("id_idioma es requerido.");

            var entCfg = await GetEntidadConfigAsync(model.entidad);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            var texto = NormalizeTexto(model.texto);
            if (string.IsNullOrWhiteSpace(texto)) return BadRequest("texto es requerido.");

            if (texto.Length > entCfg.max_len_texto)
                return BadRequest($"texto excede max_len_texto ({entCfg.max_len_texto}).");

            // valida idioma exista y activo (si querés permitir traducciones para idiomas inactivos, sacá el filtro)
            var idioma = await _context.ef_idiomas.AsNoTracking().FirstOrDefaultAsync(x => x.id_idioma == model.id_idioma);
            if (idioma == null) return BadRequest("Idioma inexistente.");

            // valida unique (entidad, id_item, id_idioma)
            var exists = await _context.ef_param_traducciones.AnyAsync(x =>
                x.entidad == model.entidad && x.id_item == model.id_item && x.id_idioma == model.id_idioma);

            if (exists) return Conflict("Ya existe la traducción para esa entidad + item + idioma.");

            model.texto = texto;
            model.fecha_alta = DateTimeOffset.UtcNow;
            model.fecha_modif = null;

            _context.ef_param_traducciones.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // ==========================================
        // 3) PUT: actualizar traducción existente
        // ==========================================
        // PUT /param_traducciones
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] ef_param_traducciones model)
        {
            if (model == null) return BadRequest();
            if (model.id_param_traduccion <= 0) return BadRequest("id_param_traduccion es requerido.");

            var db = await _context.ef_param_traducciones.FirstOrDefaultAsync(x => x.id_param_traduccion == model.id_param_traduccion);
            if (db == null) return NotFound();

            // entidad config (la del registro existente)
            var entCfg = await GetEntidadConfigAsync(db.entidad);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            // No permito cambiar la clave lógica (entidad, id_item, id_idioma) por update
            // Solo editable: texto, orden, activo
            var texto = NormalizeTexto(model.texto);
            if (string.IsNullOrWhiteSpace(texto)) return BadRequest("texto es requerido.");

            if (texto.Length > entCfg.max_len_texto)
                return BadRequest($"texto excede max_len_texto ({entCfg.max_len_texto}).");

            db.texto = texto;

            // si la entidad NO usa orden, lo ignoramos (o lo dejamos en null)
            db.orden = entCfg.usa_orden ? model.orden : null;

            db.activo = model.activo;
            db.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(db);
        }

        // ==========================================
        // 4) DELETE (opcional)
        // ==========================================
        // DELETE /param_traducciones?Id=123
        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] long Id)
        {
            if (Id <= 0) return BadRequest("Id es requerido.");

            var db = await _context.ef_param_traducciones.FirstOrDefaultAsync(x => x.id_param_traduccion == Id);
            if (db == null) return NotFound();

            // entidad config
            var entCfg = await GetEntidadConfigAsync(db.entidad);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            _context.ef_param_traducciones.Remove(db);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ==========================================
        // 5) UPSERT BATCH (guardar grilla completa)
        // ==========================================
        // POST /param_traducciones/UpsertBatch
        [HttpPost("UpsertBatch")]
        public async Task<ActionResult> UpsertBatch([FromBody] ParamTraduccionUpsertBatchRequest req)
        {
            if (req == null) return BadRequest();
            var ent = NormalizeEntidad(req.entidad);
            if (string.IsNullOrWhiteSpace(ent)) return BadRequest("entidad es requerida.");
            if (req.id_item <= 0) return BadRequest("id_item es requerido.");
            if (req.items == null || req.items.Count == 0) return BadRequest("items es requerido.");

            var entCfg = await GetEntidadConfigAsync(ent);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            // idiomas activos (para validar “tiene que estar es-AR” y/o “tiene que estar todos”)
            var idiomasActivos = await _context.ef_idiomas
                .AsNoTracking()
                .Where(x => x.activo)
                .Select(x => new { x.id_idioma, x.locale })
                .ToListAsync();

            var esAr = idiomasActivos.FirstOrDefault(x => x.locale == "es-AR");
            if (entCfg.requiere_es_ar && esAr == null)
                return BadRequest("No existe idioma es-AR activo, y la entidad lo requiere.");

            // Normalizo items (y filtro textos vacíos)
            var itemsNorm = req.items
                .Select(x => new ParamTraduccionUpsertItem
                {
                    id_idioma = x.id_idioma,
                    texto = NormalizeTexto(x.texto),
                    orden = x.orden,
                    activo = x.activo
                })
                .Where(x => x.id_idioma > 0) // sanity
                .ToList();

            // Validación: max_len_texto
            foreach (var it in itemsNorm)
            {
                if (!string.IsNullOrWhiteSpace(it.texto) && it.texto.Length > entCfg.max_len_texto)
                    return BadRequest($"texto excede max_len_texto ({entCfg.max_len_texto}) para idioma {it.id_idioma}.");
            }

            // Validación: requiere es-AR con texto
            if (entCfg.requiere_es_ar)
            {
                var itEs = itemsNorm.FirstOrDefault(x => x.id_idioma == esAr!.id_idioma);
                if (itEs == null || string.IsNullOrWhiteSpace(itEs.texto))
                    return BadRequest("Falta texto en es-AR (requerido).");
            }

            // Validación: requiere todos idiomas activos (si lo activás)
            if (entCfg.requiere_todos_idiomas)
            {
                var setEnRequest = new HashSet<short>(itemsNorm.Where(x => !string.IsNullOrWhiteSpace(x.texto)).Select(x => x.id_idioma));
                var faltan = idiomasActivos.Where(i => !setEnRequest.Contains(i.id_idioma)).Select(i => i.locale).ToList();
                if (faltan.Count > 0)
                    return BadRequest("Faltan traducciones para idiomas activos: " + string.Join(", ", faltan));
            }

            // Traigo existentes del item
            var existentes = await _context.ef_param_traducciones
                .Where(x => x.entidad == ent && x.id_item == req.id_item)
                .ToListAsync();

            // Upsert por idioma
            foreach (var it in itemsNorm)
            {
                // Si el texto está vacío, no inserto ni actualizo. (Si preferís “vaciar”, avisame y lo cambiamos)
                if (string.IsNullOrWhiteSpace(it.texto))
                    continue;

                // Si querés que solo se traduzca a idiomas activos:
                var idiomaActivo = idiomasActivos.Any(x => x.id_idioma == it.id_idioma);
                if (!idiomaActivo)
                    continue;

                var ex = existentes.FirstOrDefault(x => x.id_idioma == it.id_idioma);

                if (ex == null)
                {
                    var nuevo = new ef_param_traducciones
                    {
                        entidad = ent,
                        id_item = req.id_item,
                        id_idioma = it.id_idioma,
                        texto = it.texto,
                        orden = entCfg.usa_orden ? it.orden : null,
                        activo = it.activo,
                        fecha_alta = DateTimeOffset.UtcNow
                    };
                    _context.ef_param_traducciones.Add(nuevo);
                }
                else
                {
                    ex.texto = it.texto;
                    ex.orden = entCfg.usa_orden ? it.orden : null;
                    ex.activo = it.activo;
                    ex.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // ==========================================
        // 6) Resumen (para badges x/4)
        // ==========================================
        // GET /param_traducciones/GetResumen?entidad=TIPO_EVENTO
        [HttpGet("GetResumen")]
        public async Task<ActionResult> GetResumen([FromQuery] string entidad)
        {
            var ent = NormalizeEntidad(entidad);
            if (string.IsNullOrWhiteSpace(ent)) return BadRequest("entidad es requerida.");

            var entCfg = await GetEntidadConfigAsync(ent);
            if (entCfg == null) return BadRequest("Entidad inválida o inactiva.");

            var idiomasActivos = await _context.ef_idiomas.CountAsync(x => x.activo);

            // Cuenta idiomas distintos con traducción activa (por item)
            var items = await (
                from t in _context.ef_param_traducciones
                join i in _context.ef_idiomas on t.id_idioma equals i.id_idioma
                where t.entidad == ent
                      && t.activo
                      && i.activo
                      && t.texto != null
                      && t.texto.Trim() != ""
                group t by t.id_item into g
                select new
                {
                    id_item = g.Key,
                    traducciones_ok = g.Select(x => x.id_idioma).Distinct().Count()
                }
            ).ToListAsync();

            return Ok(new
            {
                entidad = ent,
                total_idiomas_activos = idiomasActivos,
                items
            });
        }
    }
}
