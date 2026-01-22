using  API.DataSchema;
using API.DataSchema.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IloginService
    {
        Task<auth_login_response> login_google(auth_google_request req);
    }
}