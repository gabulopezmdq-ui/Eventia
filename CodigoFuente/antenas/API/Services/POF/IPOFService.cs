using  API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IPOFService
    {
        Task<string> ValidarEst(int idEstablecimiento);
        Task<MEC_Personas> GetPersonaByDocumento(string nroDocumento);
        Task<MEC_Personas> AddPersona(MEC_Personas persona);
        Task<(MEC_Personas persona, string errorMessage)> ValidarPersonas(MEC_Personas persona);
        Task<(bool Existe, MEC_POF? PofData, string Mensaje)> VerificarPofAsync(string dni, string legajo, int idEstablecimiento);
    }
}
