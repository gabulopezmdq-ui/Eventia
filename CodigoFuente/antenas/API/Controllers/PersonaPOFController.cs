using API.DataSchema;
using API.Migrations;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class PersonaPOFController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_POF> _serviceGenerico;
        private readonly IPOFService _pofService; // Cambiado a IPOFService

        public PersonaPOFController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF> serviceGenerico, IPOFService pofService) // Cambiado a IPOFService
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _pofService = pofService;
        }

        [HttpPost]
        public async Task<ActionResult> ObtenerDatosPorDNI([FromBody] BuscarPersonaRequest request)
        {
            // Validar que el DNI sea válido
            if (string.IsNullOrWhiteSpace(request.DNI))
            {
                return BadRequest("El campo DNI es obligatorio.");
            }

            // Buscar en la tabla MEC_Personas
            var persona = await _context.MEC_Personas
                .FirstOrDefaultAsync(p => p.DNI == request.DNI);

            // Verificar si se encontró el registro
            if (persona == null)
            {
                return NotFound("No se encontró una persona con el DNI proporcionado.");
            }

            // Retornar los datos de la persona
            return Ok(new
            {
                persona.Legajo,
                persona.Nombre,
                persona.Apellido
            });
        }

        // Clase para el request
        public class BuscarPersonaRequest
        {
            public string DNI { get; set; }
        }
    }
}