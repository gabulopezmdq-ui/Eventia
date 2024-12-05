using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IProcesarMecanizadaService<T> where T : class
    {
        Task<string> HandlePreprocesarArchivoAsync(int idCabecera);
        Task PreprocesarAsync(int idCabecera);
    }

}
