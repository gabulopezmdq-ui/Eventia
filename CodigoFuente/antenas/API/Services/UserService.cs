using API.DataSchema;
using API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO.Compression;

namespace API.Services
{
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int GetAuthenticatedUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
            {
                throw new Exception("Usuario no autenticado.");
            }
            return int.Parse(userIdClaim.Value);
        }
    }
}