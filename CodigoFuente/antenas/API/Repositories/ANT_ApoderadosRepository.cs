using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
using API.DataSchema;
using API.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
//using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata;
using System;
using SQLitePCL;

namespace API.Repositories
{
    public class ANT_ApoderadosRepository : BaseRepository<ANT_Apoderados>, IANT_ApoderadosRepository
    {

        private readonly DataContext _context;
        public ANT_ApoderadosRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<ANT_Apoderados> Find(int id)
        {
            ANT_Apoderados apoderado = await _context.ANT_Apoderados
        .Include(x => x.Apellido)
        .Include(x => x.Nombre)
        .Include(x => x.NroDoc)
        .Include(x => x.Prestador)
            .ThenInclude(y => y.RazonSocial)
        .IgnoreAutoIncludes()
        .AsNoTracking()
        .FirstOrDefaultAsync(e => e.IdApoderado == id);
            return apoderado;

        }
        public async Task<IEnumerable<ANT_Apoderados>> GetPrestador(string prestador)
        {
            return await _context.ANT_Apoderados
                .Include(a => a.Prestador)
                .Where(a => a.Prestador.Any(p => p.RazonSocial.Contains(prestador)))
                .ToListAsync();

        }
    }
}