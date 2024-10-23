using  API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IImportacionMecanizadaService<T> where T : class
    {
        Task ImportarExcel(IFormFile file, int idCabecera);
    }
}