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
    public class qrController : ControllerBase
    {
        private readonly IQrService _svc;
        public qrController(IQrService svc) => _svc = svc;


        public qrController(IConfiguration config, DataContext context, ICRUDService<ef_usuarios> service)
        {
 
        }

        [HttpGet("{qrToken}")]
        public async Task<IActionResult> Get(string qrToken)
        {
            var result = await _svc.GetByQrTokenAsync(qrToken);
            if (result == null) return NotFound("QR inválido.");
            return Ok(result);
        }
    }
}