using System.Threading.Tasks;
using IdentityServer.Models;
using IdentityServerHost.Quickstart.UI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityServer.Quickstart.Account
{
    [SecurityHeaders]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class RoleController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public RoleController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Index([FromBody] AddRoleModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
                return NotFound();

            if (await _userManager.IsInRoleAsync(user, model.Role))
            {
                var result = await _userManager.RemoveFromRoleAsync(user, model.Role);

                if (result.Succeeded)
                {
                    user.Roles = await _userManager.GetRolesAsync(user);
                    return Ok(user);
                }
                else
                    return BadRequest($"Role failed to remove role {model.Role}");
            }
            else
            {
                var result = await _userManager.AddToRoleAsync(user, model.Role);

                if (result.Succeeded)
                {
                    user.Roles = await _userManager.GetRolesAsync(user);
                    return Ok(user);
                }
                else
                    return BadRequest($"Role failed to add role {model.Role}");
            }
        }       
    }
}
