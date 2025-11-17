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
                            CargoNombre = c.CargoNombre,
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
                    cargo.CargoNombre,
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
                              Cargo = x.CargoNombre,
                              CargoNombre = x.CargoNombreFromNomen ?? x.CargoNombre?.ToString(),
                              CodPlanta = x.CodPlanta,
                              Caracter = x.Caracter,
                              TipoDesig = x.TipoDesig
                          });

            return docentes;
        }


        //trae los datos de secuencia y tipoCargo de la POF en relacion al nroLegajo de EFIMuni
        public async Task<IEnumerable<EFIDocPOFDTO>> GetEFIPOFAsync(string codDepend)
        {
            var docentesQuery =
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
                //where cargo.NroLegajo == 35666
                where cargo.FechaBaja == new DateTime(1894, 4, 15)
                select new
                {
                    NroOrden = cargo.NroOrden ?? 0,
                    // <-- Fuente correcta del legajo EFI: viene de la tabla Legajos (legajo.NroLegajo)
                    LegajoEFIString = legajo.NroLegajo.ToString(),
                    Nombre = legajo.Nombre,
                    NroDoc = legajo.NroDoc.ToString(),
                    CargoNombre = cargo.CargoNombre != null ? cargo.CargoNombre.ToString() : null,
                    CargoNombreFromNomen = nomen != null ? nomen.Descripcion : null,
                    CodPlanta = cara.CodPlanta != null
                        ? cara.CodPlanta.ToString()
                        : (cargo.CodPlanta != null ? cargo.CodPlanta.ToString() : null),
                    Caracter = cara.Descrip,
                    TipoDesig = tipo.Descrip
                };

            var docentes = await docentesQuery.ToListAsync();

            // Lista de DNI que trajo EFI (para buscar en MEC_Personas)
            var dniList = docentes.Select(d => d.NroDoc).Distinct().ToList();

            var personas = await _context.MEC_Personas
                        .Where(p => dniList.Contains(p.DNI))
                        .ToListAsync();

            var personaIds = personas.Select(p => p.IdPersona).Distinct().ToList();

            var pofs = await _context.MEC_POF
                        .Where(p => personaIds.Contains(p.IdPersona))
                        .Include(p => p.Persona)
                        .ToListAsync();

            var result =
                from d in docentes
                join p in personas on d.NroDoc equals p.DNI into perJoin
                from p in perJoin.DefaultIfEmpty()
                join pf in pofs on p?.IdPersona equals pf.IdPersona into pofJoin
                from pf in pofJoin.DefaultIfEmpty()
                select new EFIDocPOFDTO
                {
                    // LegajoEFI viene del legajo real (tabla Legajos) y se convierte a int
                    LegajoEFI = int.TryParse(d.LegajoEFIString, out var le) ? le : 0,
                    LegajoMEC = p?.Legajo,
                    Barra = d.NroOrden,
                    Apellido = d.Nombre.Split(',')[0].Trim(),
                    Nombre = d.Nombre.Split(',').Length > 1 ? d.Nombre.Split(',')[1].Trim() : d.Nombre,
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
