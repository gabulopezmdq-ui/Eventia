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
    public interface IANT_PrestadoresRepository : IRepository<ANT_Prestadores>
    {
        Task<ANT_Prestadores> Find(int id);
        Task<IEnumerable<ANT_Apoderados>> GetApoderado(int idPrestador);
        Task AddApoderado(int idPrestador, int idApoderado);
        Task DeleteApoderado(int idPrestador, int idApoderado);
    }
}