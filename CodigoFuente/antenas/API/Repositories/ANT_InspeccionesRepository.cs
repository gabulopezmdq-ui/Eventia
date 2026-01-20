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
    public class ANT_InspeccionesRepository : BaseRepository<ANT_Inspecciones>, IANT_InspeccionesRepository
    {

        private readonly DataContext _context;
        public ANT_InspeccionesRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<ANT_Inspecciones> Find(int id)
        {
            ANT_Inspecciones inspeccion = await _context.ANT_Inspecciones
                .Include(x => x.Antena)
                    .ThenInclude(a => a.CellId)
                .IgnoreAutoIncludes()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.IdInspeccion == id);
            return inspeccion;
        }

        public async Task<IEnumerable<ANT_Antenas>> GetAntenas (int idInspeccion)
        {
            IEnumerable<ANT_Antenas> antena = new List<ANT_Antenas>();
            ANT_Inspecciones inspeccion = new ANT_Inspecciones();
            inspeccion = await _context.ANT_Inspecciones.FindAsync(idInspeccion);
            return new List<ANT_Antenas> { inspeccion.Antena };
        }

    }
}