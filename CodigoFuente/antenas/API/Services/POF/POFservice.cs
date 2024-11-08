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
        
        public async Task<MEC_Personas> AddPersona(MEC_Personas persona)
        {
            _context.MEC_Personas.Add(persona);
            await _context.SaveChangesAsync();
            return persona;
        }


        //probar otro tipo de codigo

        // Método para verificar la existencia de la persona en MEC_POF con un DNI, Legajo y Establecimiento específicos.
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

            await AddPersona(nuevaPersona); // Usar el método existente para agregar la persona

            return "Persona registrada correctamente.";
        }

        public async Task<bool> GuardarPersonaAsync(MEC_Personas persona)
        {
            _context.MEC_Personas.Add(persona);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ExisteRegistroEnPOFAsync(int idPersona, int idEstablecimiento)
        {
            return await _context.MEC_POF.AnyAsync(p => p.IdPersona == idPersona && p.IdEstablecimiento == idEstablecimiento);
        }

        public async Task<string> RegistrarPOFAsync(string dni, int idEstablecimiento, string secuencia, string barra,
            int idCategoria, string tipoCargo, string vigente)
        {
            // Verificar si la persona existe en MEC_Personas
            var personaExistente = await _context.MEC_Personas.FirstOrDefaultAsync(p => p.DNI == dni);

            if (personaExistente == null)
            {
                return "No se encontró una persona con el DNI proporcionado.";
            }

            // Verificar si ya existe un registro en MEC_POF para esta persona y establecimiento
            if (await ExisteRegistroEnPOFAsync(personaExistente.IdPersona, idEstablecimiento))
            {
                return "Ya existe un registro en MEC_POF para esta persona y establecimiento.";
            }

            // Si no existe, proceder a crear el nuevo registro
            var nuevaPOF = new MEC_POF
            {
                IdPersona = personaExistente.IdPersona,  // Guardar el IdPersona
                IdEstablecimiento = idEstablecimiento,
                Secuencia = secuencia,
                Barra = barra,
                IdCategoria = idCategoria,
                TipoCargo = tipoCargo,
                Vigente = vigente
            };

            _context.MEC_POF.Add(nuevaPOF);
            await _context.SaveChangesAsync();
            return "POF registrada correctamente.";
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
    }
}