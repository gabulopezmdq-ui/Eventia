using API.DataSchema;
using API.DataSchema.DTO;
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
        Task<string> ProcesarSiEsValidoAsync(int idCabecera, int usuario);
        public List<ErroresPOFDTO> ErroresPOFAgrupados();
        List<ErroresTMPEFIDTO> TMPEFIAgrupados();
    }

}
