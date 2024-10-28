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
        Task<(bool Existe, MEC_Personas? Persona, string Mensaje, object? DatosRegistroManual)> VerificarYRegistrarPersonaAsync(string nroDocumento);
        Task<string> CompletarRegistroPersonaAsync(string dni, string legajo, string apellido, string nombre);
        Task<bool> GuardarPersonaAsync(MEC_Personas persona);
        Task<bool> ExisteRegistroEnPOFAsync(int idPersona, int idEstablecimiento);
        Task<string> RegistrarPOFAsync(string dni, int idEstablecimiento, string secuencia, string barra,
            int idCategoria, string tipoCargo, string cantHsCargo, int antigAnios, int antigMeses,
            string sinHaberes, string subvencionada, string vigente);
    }
}
