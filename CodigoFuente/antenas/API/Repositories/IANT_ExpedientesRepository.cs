using  API.DataSchema;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using IdentityModel;

namespace API.Repositories
{
    public interface IANT_ExpedientesRepository : IRepository<ANT_Expedientes>
    {
        Task<ANT_Expedientes> Find(int id);
    }
}