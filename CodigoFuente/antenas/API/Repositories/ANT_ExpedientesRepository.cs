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
using Microsoft.AspNetCore.Mvc;

namespace API.Repositories
{
    public class ANT_ExpedientesRepository : BaseRepository<ANT_Expedientes>, IANT_ExpedientesRepository
    {

        private readonly DataContext _context;

        public ANT_ExpedientesRepository(DataContext context) : base(context)
        {
            _context = context;
        }
        public override async Task<ANT_Expedientes> Find(int id)
        {
            return await _context.ANT_Expedientes
                .Include(e => e.EstadoTramite)
                .ThenInclude( t => t.Estado)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.IdExpediente == id);
        }


        public async Task<IEnumerable<ANT_EstadoTramites>> GetEstado(int idEstado)
        {
            ANT_Expedientes expediente = await _context.ANT_Expedientes
                .Include(e => e.EstadoTramite)
                .FirstOrDefaultAsync(e => e.IdExpediente == idEstado);
            return new List<ANT_EstadoTramites> { expediente.EstadoTramite };
        }

    }
}