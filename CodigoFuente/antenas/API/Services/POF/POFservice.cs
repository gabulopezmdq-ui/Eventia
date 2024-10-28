using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using API.Migrations;

namespace API.Services
{
    public class POFService : IPOFService
    {
        private readonly DataContext _context;

        public POFService(DataContext context)
        {
            _context = context;
        }

        public async Task<string> ValidarEst(int idEstablecimiento)
        {
            // Verificar si el establecimiento está seleccionado
            if (idEstablecimiento <= 0)
            {
                return "Debe seleccionar un Establecimiento.";
            }

            // Comprobar si el establecimiento existe
            var establecimiento = await _context.MEC_Establecimientos.FindAsync(idEstablecimiento);
            if (establecimiento == null)
            {
                return "El Establecimiento no existe.";
            }

            return null; // No hay errores
        }

        public async Task<MEC_Personas> GetPersonaByDocumento(string nroDocumento)
        {
            return await _context.MEC_Personas.FirstOrDefaultAsync(p => p.DNI == nroDocumento);
        }

        public async Task<MEC_Personas> AddPersona(MEC_Personas persona)
        {
            _context.MEC_Personas.Add(persona);
            await _context.SaveChangesAsync();
            return persona;
        }

        public async Task<(MEC_Personas persona, string errorMessage)> ValidarPersonas(MEC_Personas persona)
        {
            // Verificar si el número de documento existe
            var existingPersona = await _context.MEC_Personas.FirstOrDefaultAsync(p => p.DNI == persona.DNI);

            if (existingPersona != null)
            {
                return (existingPersona, null); // Retorna la persona existente
            }

            // Si no existe, valida los datos obligatorios
            if (string.IsNullOrWhiteSpace(persona.Apellido) || string.IsNullOrWhiteSpace(persona.Nombre))
            {
                return (null, "Debe completar los datos obligatorios (*)");
            }

            // Crear un nuevo registro en MEC_Personas
            _context.MEC_Personas.Add(persona);
            await _context.SaveChangesAsync();

            return (persona, null); // Retorna la nueva persona creada
        }

        //probar otro tipo de codigo

        // Método para verificar la existencia de la persona en MEC_POF con un DNI, Legajo y Establecimiento específicos.
        public async Task<(bool Existe, MEC_POF? PofData, string Mensaje)> VerificarPofAsync(string dni, string legajo, int idEstablecimiento)
        {
            // Busca la persona en la tabla MEC_Personas con el DNI y el Legajo especificados
            var persona = await _context.MEC_Personas
                .FirstOrDefaultAsync(p => p.DNI == dni && p.Legajo == legajo);

            if (persona == null)
            {
                // Retorna una tupla con los valores requeridos en vez de un tipo anónimo
                return (false, null, "La persona no está registrada.");
            }

            // Verifica si existe una entrada en MEC_POF con el idPersona y idEstablecimiento
            var pof = await _context.MEC_POF
                .Include(p => p.Establecimiento) // Para obtener datos del establecimiento
                .Include(p => p.Persona)         // Para obtener datos de la persona
                .FirstOrDefaultAsync(p =>
                    p.IdPersona == persona.IdPersona &&
                    p.IdEstablecimiento == idEstablecimiento);

            if (pof != null)
            {
                return (true, pof, "Registro encontrado.");
            }

            return (false, null, "La persona no está registrada en este establecimiento.");
        }
    }
}