using API.DataSchema;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using API.DataSchema.DTO;

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
            var pof = await _context.MEC_POF.AnyAsync(p => p.IdPersona == idPersona && p.IdEstablecimiento == idEstablecimiento && p.Secuencia == secuencia);

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

        //getpof barras
        public async Task<List<MEC_POF_Barras>> GetBarrasPOF(int idPOF)
        {
            return await _context.MEC_POF_Barras.Where(a => a.IdPOF == idPOF && a.Vigente == "S").ToListAsync();
        }

        public async Task<POFBarraResultado> AddBarraAsync(POFBarraDTO dto)
        {
            var resultado = new POFBarraResultado();

            if (dto == null || dto.Barra == null || dto.Barra.Count == 0)
                return resultado;

            foreach (var barraDto in dto.Barra)
            {
                if (!int.TryParse(barraDto.Barra, out int barraInt))
                {
                    continue;
                }

                bool existe = await _context.MEC_POF_Barras
                    .AnyAsync(b => b.IdPOF == dto.IdPOF && b.Barra == barraInt && b.Vigente == "S");

                if (existe)
                {
                    resultado.BarrasDuplicadas.Add(barraInt);
                    continue;
                }

                var nuevaBarra = new MEC_POF_Barras
                {
                    IdPOF = dto.IdPOF,
                    Barra = barraInt,
                    Vigente = "S"
                };

                _context.MEC_POF_Barras.Add(nuevaBarra);
                resultado.BarrasAgregadas.Add(barraInt);
            }

            await _context.SaveChangesAsync();

            return resultado;
        }
        public async Task<bool> EliminarBarraAsync(EliminarBarraDTO dto)
        {
            var barra = await _context.MEC_POF_Barras.FindAsync(dto.IdPOFBarra);

            if (barra == null || barra.IdPOF != dto.IdPOF)
                return false;

            barra.Vigente = "N";

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<PofConBarrasDTO>> ExcelPOF(int idEstablecimiento)
        {
            var pofList = await _context.MEC_POF
                .Where(p => p.IdEstablecimiento == idEstablecimiento)
                .Include(p => p.Persona)
                .Include(p => p.POFBarras)
                .OrderBy(b => b.Persona.Apellido)
                .Select(p => new PofConBarrasDTO
                {
                    Apellido = p.Persona.Apellido,
                    Nombre = p.Persona.Nombre,
                    DNI = p.Persona.DNI,
                    Legajo = p.Persona.Legajo,
                    Secuencia = p.Secuencia,
                    TipoCargo = p.TipoCargo,
                    Vigente = p.Vigente,
                    Barra = p.Barra,
                    Barras = p.POFBarras
                    .Where(b => b.Vigente == "S")
                    .Select(b => b.Barra).ToList()
                })
                .ToListAsync();

            return pofList;
        }

        //BORRADO DEFINITIVO POV
        //AGREGAR VALIDACIONES PARA QUE NO ELIMINE ALGUNA POF CON REGISTROS ASOCIADOS
        public async Task<bool> EliminarPOF(int IdPOF)
        {
            // Verificamos si existe la POF
            var pof = await _context.MEC_POF
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.IdPOF == IdPOF);

            if (pof == null)
                return false;

            if (await _context.MEC_Mecanizadas.AnyAsync(m => m.IdPOF == IdPOF))
                throw new InvalidOperationException("No se puede eliminar: tiene mecanizadas asociadas.");

            if (await _context.MEC_BajasDetalle.AnyAsync(b => b.IdPOF == IdPOF))
                throw new InvalidOperationException("No se puede eliminar: tiene bajas asociadas.");

            if (await _context.MEC_MovimientosDetalle.AnyAsync(md => md.IdPOF == IdPOF))
                throw new InvalidOperationException("No se puede eliminar: tiene movimientos detalle asociados.");

            if (await _context.MEC_MovimientosBajas.AnyAsync(mb => mb.IdPOF == IdPOF))
                throw new InvalidOperationException("No se puede eliminar: tiene movimientos de baja asociados.");

            if (await _context.MEC_POF_Barras.AnyAsync(pb => pb.IdPOF == IdPOF && pb.Vigente == "S"))
                throw new InvalidOperationException("No se puede eliminar: tiene barras asociadas.");

            if (await _context.MEC_InasistenciasDetalle.AnyAsync(i => i.IdPOF == IdPOF))
                throw new InvalidOperationException("No se puede eliminar: tiene inasistencias asociadas.");

            var entity = new MEC_POF { IdPOF = IdPOF };
            _context.MEC_POF.Attach(entity);
            _context.MEC_POF.Remove(entity);

            await _context.SaveChangesAsync();
            return true;
        }

        //GRABAR POF POR EFI
        private async Task<int?> ObtenerPersonaEFI(string documento)
        {
            if (string.IsNullOrEmpty(documento))
                return null;

            var persona = await _context.MEC_Personas
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.DNI == documento);

            return persona?.IdPersona;
        }

        private async Task<int?> ObtenerEstEFI(string UE)
        {
            if (string.IsNullOrEmpty(UE))
                return null;

            var est = await _context.MEC_Establecimientos
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UE == UE);

            return est?.IdEstablecimiento;
        }
        private async Task<int?> ObtenerFuncionEFI(string funcion)
        {
            if (string.IsNullOrEmpty(funcion))
                return null;

            var idFuncion = await _context.MEC_TiposFunciones
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.CodFuncion == funcion);

            return idFuncion?.IdTipoFuncion;
        }

        public async Task<MEC_POF?> CrearPOFAsync(ErroresTMPEFIDTO dto, int carRevista, int cargo, List<int> barras)
        {
            var idPersona = await ObtenerPersonaEFI(dto.Documento);
            var idEst = await ObtenerEstEFI(dto.UE);
            var idFuncion = await ObtenerFuncionEFI(dto.Funcion);

            if (idPersona == null || idEst == null)
                return null;

            // VALIDACIÓN: evitar duplicados
            bool existePOF = await _context.MEC_POF
                .AnyAsync(p => p.IdPersona == idPersona.Value &&
                               p.IdEstablecimiento == idEst.Value &&
                               p.Secuencia == dto.Secuencia);

            if (existePOF)
            {
                // Cambiar estado de MEC_TMPEFI a "EX"
                var registrosTMPEFI = await _context.MEC_TMPEFI
                    .Where(e => e.Documento == dto.Documento && e.Estado == "NE")
                    .ToListAsync();

                foreach (var r in registrosTMPEFI)
                    r.Estado = "EX";

                if (registrosTMPEFI.Count > 0)
                    await _context.SaveChangesAsync();

                // No crear POF porque ya existe
                return null;
            }

            // Crear nuevo registro si no existe duplicado
            var nuevoPOF = new MEC_POF
            {
                IdEstablecimiento = idEst.Value,
                IdPersona = idPersona.Value,
                IdFuncion = idFuncion ?? 0,
                IdCarRevista = carRevista,
                Secuencia = dto.Secuencia ?? string.Empty,
                IdCategoria = cargo,
                TipoCargo = dto.TipoCargo ?? string.Empty,
                Vigente = "S"
            };

            _context.MEC_POF.Add(nuevoPOF);
            await _context.SaveChangesAsync();

            if (barras != null && barras.Any())
            {
                var barrasPOF = barras.Select(b => new MEC_POF_Barras
                {
                    IdPOF = nuevoPOF.IdPOF,
                    Barra = b,
                    Vigente = "S"
                }).ToList();

                _context.MEC_POF_Barras.AddRange(barrasPOF);
                await _context.SaveChangesAsync();
            }


            var registrosTMPEFIExito = await _context.MEC_TMPEFI
                .Where(e => e.Documento == dto.Documento && e.Estado == "NP")
                .ToListAsync();

            foreach (var r in registrosTMPEFIExito)
                r.Estado = "EX";

            if (registrosTMPEFIExito.Count > 0)
                await _context.SaveChangesAsync();

            return nuevoPOF;
        }


    }
}