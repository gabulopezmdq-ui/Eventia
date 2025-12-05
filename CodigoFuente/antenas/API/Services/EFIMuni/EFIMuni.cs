using API.DataSchema;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Globalization;
using static Bogus.Person.CardAddress;
using static API.Services.EFIMuniService;
using API.DataSchema.DTO;

namespace API.Services
{
    public class EFIMuniService : IEFIMuniService
    {
        private readonly EFIDBContext _efiContext;
        private readonly DataContext _context;

        public EFIMuniService(EFIDBContext efiContext, DataContext context)
        {
            _efiContext = efiContext;
            _context = context;
        }

        public async Task<IEnumerable<EFIMuniDTO>> ObtenerLegajoConCargoAsync(int nroLegajo)
        {
            var query = from l in _efiContext.Legajos
                        join c in _efiContext.Cargos on l.NroLegajo equals c.NroLegajo
                        join cd in _efiContext.Caradesi on c.Caracter equals cd.Caracter into cdJoin
                        from cd in cdJoin.DefaultIfEmpty()
                        join td in _efiContext.TipoDesi on c.TipoDesig equals td.TipoDesig into tdJoin
                        from td in tdJoin.DefaultIfEmpty()
                        where l.NroLegajo == nroLegajo
                        select new EFIMuniDTO
                        {
                            Nombre = l.Nombre,
                            NroDoc = l.NroDoc,
                            CargoNombre = c.Cargo,
                            CodPlanta = cd.CodPlanta ?? c.CodPlanta,
                            CaracterDescripcion = cd.Descrip,
                            TipoDesigDescripcion = td.Descrip
                        };

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<DocenteDTO>> GetDocentesByUEAsync(string codDepend)
        {
            var query =
                from cargo in _efiContext.Cargos
                join legajo in _efiContext.Legajos on cargo.NroLegajo equals legajo.NroLegajo
                join cara in _efiContext.Caradesi on cargo.Caracter equals cara.Caracter into caraJoin
                from cara in caraJoin.DefaultIfEmpty()
                join tipo in _efiContext.TipoDesi on cargo.TipoDesig equals tipo.TipoDesig into tipoJoin
                from tipo in tipoJoin.DefaultIfEmpty()
                join nomen in _efiContext.Nomen
                                            on new { CargoValue = (int)9, CodGrupo = (int?)cargo.CodGrupo }
                                            equals new { CargoValue = (int)nomen.Cargo, CodGrupo = (int?)nomen.CodGrupo }
                                            into nomenJoin
                from nomen in nomenJoin.DefaultIfEmpty()
                where cargo.CodDepend == codDepend
                //where cargo.NroLegajo == 35642
                where cargo.FechaBaja == new DateTime(1894, 4, 15) //esta es la fecha que es considerada NULL en EFImuni
                select new
                {
                    cargo.NroOrden,
                    cargo.NroLegajo,
                    legajo.Nombre,
                    legajo.NroDoc,
                    cargo.Cargo,
                    CargoNombreFromNomen = nomen != null ? nomen.Descripcion : null,
                    CodPlanta = cara.CodPlanta ?? cargo.CodPlanta,
                    Caracter = cara.Descrip,
                    TipoDesig = tipo.Descrip
                };

            var docentes = (await query.ToListAsync())
                          .Select(x => new DocenteDTO
                          {
                              Apellido = x.Nombre.Split(',')[0].Trim(),
                              Nombre = x.Nombre.Split(',').Length > 1 ? x.Nombre.Split(',')[1].Trim() : x.Nombre,
                              NroDoc = x.NroDoc,
                              Legajo = x.NroLegajo,
                              Barra = x.NroOrden,
                              Cargo = x.Cargo,
                              CargoNombre = x.CargoNombreFromNomen ?? x.Cargo?.ToString(),
                              CodPlanta = x.CodPlanta,
                              Caracter = x.Caracter,
                              TipoDesig = x.TipoDesig
                          });

            return docentes;
        }


        //trae los datos de secuencia y tipoCargo de la POF en relacion al nroLegajo de EFIMuni
        public async Task<IEnumerable<EFIDocPOFDTO>> GetEFIPOFAsync(string codDepend, List<string>? dniMEC = null)
        {
            //DOCENTES: cargos asociados a codDepend
            var docentesQuery =
                        from cargo in _efiContext.Cargos
                        join legajo in _efiContext.Legajos
                            on cargo.NroLegajo equals legajo.NroLegajo

                        join cara in _efiContext.Caradesi
                            on cargo.Caracter equals cara.Caracter into caraJoin
                        from cara in caraJoin.DefaultIfEmpty()

                        join tipo in _efiContext.TipoDesi
                            on cargo.TipoDesig equals tipo.TipoDesig into tipoJoin
                        from tipo in tipoJoin.DefaultIfEmpty()

                        join nomen in _efiContext.Nomen
                                        on new
                                        {
                                            CodGrupo = cargo.CodGrupo,
                                            Cargo = cargo.Cargo,
                                            CodNivel = cargo.CodNivel
                                        }
                                        equals new
                                        {
                                            CodGrupo = (int?)nomen.CodGrupo,
                                            Cargo = (int?)nomen.Cargo,
                                            CodNivel = (int?)nomen.CodNivel
                                        }
                                        into nomenJoin
                        from nomen in nomenJoin.DefaultIfEmpty()

                        where cargo.CodDepend == codDepend
                        where cargo.FechaBaja == new DateTime(1894, 4, 15)

                        select new
                        {
                            NroOrden = cargo.NroOrden ?? 0,
                            LegajoEFIString = legajo.NroLegajo.ToString(),
                            NombreCompleto = legajo.Nombre,
                            NroDoc = legajo.NroDoc.ToString(),
                            CargoNombre = cargo.Cargo != null ? cargo.Cargo.ToString() : null,
                            CargoNombreFromNomen = nomen != null ? nomen.Descripcion : null,
                            CodPlanta = cara.CodPlanta != null
                                ? cara.CodPlanta.ToString()
                                : (cargo.CodPlanta != null ? cargo.CodPlanta.ToString() : null),
                            Caracter = cara.Descrip,
                            TipoDesig = tipo.Descrip
                        };


            var docentes = await docentesQuery.ToListAsync();


            // 2. DNI totales (docentes + MEC)
            var dniTotales = new List<string>();
            dniTotales.AddRange(docentes.Select(d => d.NroDoc));

            if (dniMEC != null && dniMEC.Any())
                dniTotales.AddRange(dniMEC);

            dniTotales = dniTotales
                .Where(d => !string.IsNullOrWhiteSpace(d))
                .Select(d => d.Trim())
                .Distinct()
                .ToList();

            var dniNumericos = dniTotales
                .Select(d => long.TryParse(d.TrimStart('0'), out var n) ? (long?)n : null)
                .Where(n => n.HasValue)
                .Select(n => n.Value)
                .Distinct()
                .ToList();


            // LEGÁJOS DIRECTOS desde liqhab.legajo 
            var legajosDirectos = await _efiContext.Legajos
                                        .Where(l => dniNumericos.Contains((long)l.NroDoc))
                                        .GroupBy(l => l.NroDoc)
                                        .Select(g => g.FirstOrDefault())
                                        .ToDictionaryAsync(
                                            l => (long)l.NroDoc,
                                            l => (Legajo: l.NroLegajo, NombreCompleto: l.Nombre)
                                        );



            var personas = await _context.MEC_Personas
                .Where(p => dniTotales.Contains(p.DNI))
                .ToListAsync();

            var personaIds = personas.Select(p => p.IdPersona).Distinct().ToList();

            var pofs = await _context.MEC_POF
                .Where(p => personaIds.Contains(p.IdPersona))
                .Include(p => p.Persona)
                .ToListAsync();


            var docentesNrosDoc = docentes.Select(d => d.NroDoc).ToHashSet();
            var extras = new List<dynamic>();

            if (dniMEC != null)
            {
                foreach (var dni in dniMEC.Select(s => s?.Trim()).Where(s => !string.IsNullOrEmpty(s)))
                {
                    if (!docentesNrosDoc.Contains(dni))
                    {
                        extras.Add(new
                        {
                            NroOrden = 0,
                            LegajoEFIString = (string?)null,
                            NombreCompleto = (string?)null,
                            NroDoc = dni,
                            CargoNombre = (string?)null,
                            CargoNombreFromNomen = (string?)null,
                            CodPlanta = (string?)null,
                            Caracter = (string?)null,
                            TipoDesig = (string?)null
                        });
                    }
                }
            }

            var docentesExtendidos = docentes.Cast<dynamic>().Concat(extras).ToList();

            var result =
                from d in docentesExtendidos
                join p in personas on d.NroDoc equals p.DNI into perJoin
                from p in perJoin.DefaultIfEmpty()
                join pf in pofs on p?.IdPersona equals pf.IdPersona into pofJoin
                from pf in pofJoin.DefaultIfEmpty()
                select new EFIDocPOFDTO
                {
                    // LEGAJO EFI
                    LegajoEFI =
                        int.TryParse(d.LegajoEFIString, out int leAux) && leAux > 0
                            ? leAux
                            : (
                                long.TryParse((d.NroDoc ?? "").TrimStart('0'), out long dniLongAux)
                                    && legajosDirectos.ContainsKey(dniLongAux)
                                        ? legajosDirectos[dniLongAux].Legajo
                                        : 0
                              ),

                    // NOMBRE Y APELLIDO
                    Apellido = GetApellido(d.NombreCompleto, d.NroDoc, legajosDirectos),
                    Nombre = GetNombre(d.NombreCompleto, d.NroDoc, legajosDirectos),

                    LegajoMEC = p?.Legajo,
                    Barra = d.NroOrden,
                    NroDoc = d.NroDoc,
                    Cargo = d.CargoNombreFromNomen ?? d.CargoNombre,
                    CodPlanta = d.CodPlanta,
                    Caracter = d.Caracter,
                    TipoDesig = d.TipoDesig,
                    Secuencia = pf?.Secuencia,
                    TipoCargo = pf?.TipoCargo
                };

            return result;
        }

        private string? GetApellido(string? nombreCompleto, string nroDoc,
        Dictionary<long, (int Legajo, string NombreCompleto)> legajosDirectos)
            {
                if (!string.IsNullOrWhiteSpace(nombreCompleto))
                    return nombreCompleto.Split(',')[0].Trim();

                if (long.TryParse(nroDoc.TrimStart('0'), out long dni)
                    && legajosDirectos.ContainsKey(dni)
                    && !string.IsNullOrWhiteSpace(legajosDirectos[dni].NombreCompleto))
                    return legajosDirectos[dni].NombreCompleto.Split(',')[0].Trim();

                return null;
            }

            private string? GetNombre(string? nombreCompleto, string nroDoc,
                Dictionary<long, (int Legajo, string NombreCompleto)> legajosDirectos)
            {
                if (!string.IsNullOrWhiteSpace(nombreCompleto))
                {
                    var partes = nombreCompleto.Split(',');
                    return partes.Length > 1 ? partes[1].Trim() : partes[0].Trim();
                }

                if (long.TryParse(nroDoc.TrimStart('0'), out long dni)
                    && legajosDirectos.ContainsKey(dni)
                    && !string.IsNullOrWhiteSpace(legajosDirectos[dni].NombreCompleto))
                {
                    var partes = legajosDirectos[dni].NombreCompleto.Split(',');
                    return partes.Length > 1 ? partes[1].Trim() : partes[0].Trim();
                }

                return null;
            }




        public async Task AltaPersonaDesdeEFI(EFIPersonaAltaDTO dto)
        {
            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var persona = await _context.MEC_Personas
                    .FirstOrDefaultAsync(p => p.DNI == dto.DNI);

                // ✅ 1. CREAR PERSONA SI NO EXISTE
                if (persona == null)
                {
                    persona = new MEC_Personas
                    {
                        DNI = dto.DNI,
                        Apellido = dto.Apellido,
                        Nombre = dto.Nombre,
                        Legajo = dto.Legajo,
                        Vigente = "S"
                    };

                    _context.MEC_Personas.Add(persona);
                    await _context.SaveChangesAsync();
                }

                // ✅ 2. CREAR ANTIGÜEDAD SI NO EXISTE
                var antiguedadExiste = await _context.MEC_POF_Antiguedades
                    .AnyAsync(a => a.IdPersona == persona.IdPersona);

                if (!antiguedadExiste)
                {
                    var antiguedad = new MEC_POF_Antiguedades
                    {
                        IdPersona = persona.IdPersona,
                        MesReferencia = dto.MesReferencia,
                        AnioReferencia = dto.AnioReferencia,
                        MesAntiguedad = dto.MesAntiguedad,
                        AnioAntiguedad = dto.AnioAntiguedad
                    };

                    _context.MEC_POF_Antiguedades.Add(antiguedad);
                    await _context.SaveChangesAsync();
                }

                // ✅ 3. ACTUALIZAR ESTADO TMPEFI (NE → NP)
                await ActualizarEstadoTMPEFI(dto.DNI);

                await trx.CommitAsync();
            }
            catch
            {
                await trx.RollbackAsync();
                throw;
            }
        }


        public async Task ActualizarEstadoTMPEFI(string documento)
        {
            var registros = await _context.MEC_TMPEFI
                .Where(e => e.Documento == documento && e.Estado == "NE")
                .ToListAsync();

            if (registros.Count == 0)
                return;

            foreach (var r in registros)
                r.Estado = "NP";

            await _context.SaveChangesAsync();
        }

    }
}
