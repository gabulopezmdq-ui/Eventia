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
    public interface IANT_AntenasRepository : IRepository<ANT_Antenas>
    {
        Task<ANT_Antenas> Find(int id);
        Task<IEnumerable<ANT_Inspecciones>> GetInspec(int idAntena);
        Task AddInspec(int idAntena, int idInspeccion);
        Task DeleteInspeccion(int idAntena, int idInspeccion);
    }
}