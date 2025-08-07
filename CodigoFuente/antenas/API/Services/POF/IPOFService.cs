using  API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IPOFService
    {
        Task<int> AddPersona(MEC_Personas persona);
        Task<(bool Existe, MEC_Personas? Persona, string Mensaje, object? DatosRegistroManual)> VerificarYRegistrarPersonaAsync(string nroDocumento);
        Task<string> CompletarRegistroPersonaAsync(string dni, string legajo, string apellido, string nombre);
        Task<bool> ExisteRegistroEnPOFAsync(int idPersona, int idEstablecimiento, string secuencia);
        Task<string> RegistrarSuplenciaAsync(int idPersona, int idEstablecimiento, string secuencia, string barra,
            int idCategoria, string tipoCargo, string vigente);
        Task<MEC_POF_Antiguedades?> GetByIdPOFAsync(int idPOF);
        Task<MEC_POF_Antiguedades> CreateOrUpdateAsync(MEC_POF_Antiguedades data);
        Task<List<MEC_POF_Barras>> GetBarrasPOF(int idPOF);
        Task<POFBarraResultado> AddBarraAsync(POFBarraDTO dto);
    }
}
