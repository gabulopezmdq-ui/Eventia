using API.DataSchema;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using API.Migrations;
using System.Globalization;
using static Bogus.Person.CardAddress;
using static API.Services.EFIMuniService;
using API.DataSchema.DTO;

namespace API.Services
{
    public class EFIMuniService: IEFIMuniService
    {
        private readonly EFIDBContext _context;

        public EFIMuniService(EFIDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EFIMuniDTO>> ObtenerLegajoConCargoAsync(int nroLegajo)
        {
            var query = from l in _context.Legajos
                        join c in _context.Cargos on l.NroLegajo equals c.NroLegajo
                        join cd in _context.Caradesi on c.Caracter equals cd.Caracter into cdJoin
                        from cd in cdJoin.DefaultIfEmpty()
                        join td in _context.TipoDesi on c.TipoDesig equals td.TipoDesig into tdJoin
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
                from cargo in _context.Cargos
                join legajo in _context.Legajos on cargo.NroLegajo equals legajo.NroLegajo
                join cara in _context.Caradesi on cargo.Caracter equals cara.Caracter into caraJoin
                from cara in caraJoin.DefaultIfEmpty()
                join tipo in _context.TipoDesi on cargo.TipoDesig equals tipo.TipoDesig into tipoJoin
                from tipo in tipoJoin.DefaultIfEmpty()
                where cargo.CodDepend == codDepend
                where cargo.FechaBaja == new DateTime(1894, 4, 15)
                select new
                {
                    cargo.NroOrden,
                    cargo.NroLegajo,
                    legajo.Nombre,
                    legajo.NroDoc,
                    cargo.CargoNombre,
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
                              CodPlanta = x.CodPlanta,
                              Caracter = x.Caracter,
                              TipoDesig = x.TipoDesig
                          });

            return docentes;
        }
    }
}
