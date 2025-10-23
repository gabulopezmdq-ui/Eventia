using  API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using static Bogus.Person.CardAddress;
using API.DataSchema.DTO;

namespace API.Services
{
    public interface IEFIMuniService
    {
        Task<IEnumerable<EFIMuniDTO>> ObtenerLegajoConCargoAsync(int nroLegajo);
        Task<IEnumerable<DocenteDTO>> GetDocentesByUEAsync(string codDepend);
    }
}