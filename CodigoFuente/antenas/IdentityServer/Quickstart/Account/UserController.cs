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
    public class UserController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize(Roles = "admin, creator")]
        public async Task<IActionResult> Index()
        {
            var users = await _userManager.Users.ToListAsync(); //All users are in the members role

            if (users == null)
                return NoContent();

            foreach (var user in users)
            {
                user.Roles = await _userManager.GetRolesAsync(user);
            }            

            return Ok(users);
        }
        
        [HttpDelete]
        [Authorize(Roles = "admin, creator")]
        public async Task<IActionResult> Index(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);

                if (user == null)
                    return NotFound();

                var result = await _userManager.DeleteAsync(user);

                if (result.Succeeded)
                {                    
                    return Ok();
                }
                else
                    return BadRequest($"Role failed to remove user { email }");
            }
            catch
            {
                return NoContent();
            }
        }
    }
}
