using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class prospectos_b2bController : ControllerBase
    {
        private readonly DataContext _context;

        public prospectos_b2bController(DataContext context)
        {
            _context = context;
        }

        // POST /prospectos_b2b/QuieroInfo
        [HttpPost("QuieroInfo")]
        public async Task<IActionResult> QuieroInfo([FromBody] ProspectoB2BCreateRequestDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.nombre_apellido)) return BadRequest("Nombre y apellido obligatorio.");
            if (string.IsNullOrWhiteSpace(req.empresa_nombre)) return BadRequest("Nombre del salón/empresa obligatorio.");
            if (string.IsNullOrWhiteSpace(req.ciudad)) return BadRequest("Ciudad obligatoria.");
            if (string.IsNullOrWhiteSpace(req.pais)) req.pais = "AR";

            var email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim().ToLowerInvariant();
            var whatsapp = string.IsNullOrWhiteSpace(req.whatsapp) ? null : NormalizarWhatsapp(req.whatsapp);

            var now = DateTimeOffset.UtcNow;

            await using var tx = await _context.Database.BeginTransactionAsync();

            var row = new ef_b2b_prospectos
            {
                nombre_apellido = req.nombre_apellido.Trim(),
                empresa_nombre = req.empresa_nombre.Trim(),
                ciudad = req.ciudad.Trim(),
                pais = req.pais.Trim(),

                email = email,
                whatsapp = whatsapp,
                eventos_por_mes = req.eventos_por_mes,

                origen = string.IsNullOrWhiteSpace(req.origen) ? "LANDING_MODAL" : req.origen.Trim(),

                campania_fuente = req.campania_fuente,
                campania_medio = req.campania_medio,
                campania_nombre = req.campania_nombre,
                campania_contenido = req.campania_contenido,
                campania_termino = req.campania_termino,

                pagina_origen = req.pagina_origen,
                referer = req.referer,

                estado = "NUEVO",
                activo = true,
                fecha_alta = now
            };

            _context.Set<ef_b2b_prospectos>().Add(row);
            await _context.SaveChangesAsync();

            // historial automático
            _context.Set<ef_b2b_prospectos_hist>().Add(new ef_b2b_prospectos_hist
            {
                id_prospecto = row.id_prospecto,
                fecha = now,
                id_usuario = null,
                tipo = "SISTEMA",
                detalle = "Prospecto creado desde modal 'Quiero info'.",
                estado_nuevo = "NUEVO",
                proximo_contacto = null
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { ok = true, mensaje = "¡Listo! Te contactaremos a la brevedad.", id_prospecto = row.id_prospecto });
        }

        private static string NormalizarWhatsapp(string w)
        {
            return Regex.Replace(w.Trim(), @"[^\d\+]", "");
        }
    }
}