using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using API.Migrations;
using Microsoft.AspNetCore.Mvc;

namespace API.Services
{
    public class POFService : IPOFService
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_Personas> _serviceGenerico;
        public POFService(DataContext context, ICRUDService<MEC_Personas> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        public async Task<int> AddPersona(MEC_Personas persona)
        {
            await _serviceGenerico.Add(persona);

            return persona.IdPersona;
        }

        //probar otro tipo de codigo

        // Método para verificar la existencia de la persona en MEC_POF con un DNI, Legajo y Establecimiento específicos.

        public async Task<string> CompletarRegistroPersonaAsync(string dni, string legajo, string apellido, string nombre)
        {
            // Validar campos obligatorios
            if (string.IsNullOrWhiteSpace(dni) || string.IsNullOrWhiteSpace(apellido) || string.IsNullOrWhiteSpace(nombre))
            {
                return "Debe completar los datos obligatorios (*)";
            }

            // Crear un nuevo registro en MEC_Personas
            var nuevaPersona = new MEC_Personas
            {
                DNI = dni,
                Legajo = legajo,
                Apellido = apellido,
                Nombre = nombre
            };

            //await AddPersona(nuevaPersona); // Usar el método existente para agregar la persona
            try
            {
                // Intentar agregar la persona usando el servicio genérico
                await _serviceGenerico.Add(nuevaPersona); // Usar el método `Add` del servicio genérico
            }
            catch (InvalidOperationException ex)
            {
                // Capturar la excepción de duplicado
                if (ex.Message == "El registro ya existe.")
                {
                    return "La persona ya está registrada.";
                }
                throw; // Si es otra excepción, volver a lanzarla
            }

            return "Persona registrada correctamente.";
        }

        public async Task<(bool Existe, MEC_Personas? Persona, string Mensaje, object? DatosRegistroManual)> VerificarYRegistrarPersonaAsync(string nroDocumento)
        {
            // Verifica si la persona existe
            var personaExistente = await _context.MEC_Personas.FirstOrDefaultAsync(p => p.DNI == nroDocumento);

            if (personaExistente != null)
            {
                // Si la persona existe, retornamos sus datos
                return (true, personaExistente, "Persona encontrada.", null);
            }

            // Si no existe, habilitamos campos para completar la información
            return (false, null, "La persona no está registrada. Completa los campos requeridos.", new { HabilitarCampos = true });
        }

        // Verifica la existencia de la existencia de un registro con la misma persona, establecimiento y secuencia
        public async Task<bool> ExisteRegistroEnPOFAsync(int idPersona, int idEstablecimiento, string secuencia)
        {
            var pof =  await _context.MEC_POF.AnyAsync(p => p.IdPersona == idPersona && p.IdEstablecimiento == idEstablecimiento && p.Secuencia == secuencia);

            return pof;
        }


        // Servicio para registrar suplencia
        public async Task<string> RegistrarSuplenciaAsync(int idPersona, int idEstablecimiento, string secuencia, string barra,
            int idCategoria, string tipoCargo, string vigente)
        {
            // Verificar si ya existe un registro en MEC_POF para esta combinación
            if (await _context.MEC_POF.AnyAsync(p => p.IdEstablecimiento == idEstablecimiento &&
                                                        p.IdPersona == idPersona &&
                                                        p.Secuencia == secuencia))  
            {
                return "Ya existe un registro en MEC_POF para esta combinación de Establecimiento, Persona y Secuencia.";
            }

            // Si no existe, aquí podrías crear una nueva entrada para la suplencia si así lo deseas
            return "Puede proceder a registrar la suplencia.";
        }


        public async Task<MEC_POF_Antiguedades?> GetByIdPOFAsync(int idPersona)
        {
            return await _context.MEC_POF_Antiguedades
                .FirstOrDefaultAsync(a => a.IdPersona == idPersona);
        }

        public async Task<MEC_POF_Antiguedades> CreateOrUpdateAsync(MEC_POF_Antiguedades data)
        {
            var existe = await GetByIdPOFAsync(data.IdPersona);

            if (existe != null)
            {
                
                existe.MesReferencia = data.MesReferencia;
                existe.AnioReferencia = data.AnioReferencia;
                existe.AnioAntiguedad = data.AnioAntiguedad;
                existe.MesAntiguedad = data.MesAntiguedad;
                _context.Update(existe);
            }
            else
            {
                _context.Add(data);
            }

            await _context.SaveChangesAsync();
            return data;
        }
    }
}