using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
using  API.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using rsAPIElevador.DataSchema;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class alimentacionController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _service;
        private readonly IRestriccionesService _serviceRestricttion;
        public alimentacionController(IRestriccionesService svc) => _serviceRestricttion = svc;



        public alimentacionController(IConfiguration config, DataContext context, ICRUDService<ef_usuarios> service)
        {
            _config = config;
            _context = context;
            _service = service;
        }

        [HttpGet("mis-restricciones/{token}")]
        public async Task<IActionResult> GetMis(string token)
        {
            return Ok(await _serviceRestricttion.GetMisRestriccionesAsync(token));
        }

        [HttpPost("mis-restricciones/{token}")]
        public async Task<IActionResult> Save(string token, RestriccionesGrupoUpsertDTO dto)
        {
            await _serviceRestricttion.SaveMisRestriccionesAsync(token, dto);
            return Ok();
        }

        [HttpGet("catalogo/{locale}")]
        public async Task<IActionResult> Catalogo(string locale)
        {
            return Ok(await _serviceRestricttion.GetCatalogoAsync(locale));
        }
    }
}