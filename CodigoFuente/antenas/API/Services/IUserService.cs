using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IUserService
    {
        int GetAuthenticatedUserId();
        Task VerifRol(MEC_RolesXUsuarios rolXUsuario);
    }
}