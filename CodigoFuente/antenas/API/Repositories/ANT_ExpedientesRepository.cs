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
                .Include(e => e.Antenas)
                .ThenInclude(a => a.TipoAntenas)
                .Include(e => e.Antenas)
                .ThenInclude(a => a.Prestador)
                .ThenInclude(p => p.Apoderados)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.IdExpediente == id);
        }


        public async Task<IEnumerable<ANT_Antenas>> GetAntena(int idAntena)
        {
            IEnumerable<ANT_Antenas> antena = new List<ANT_Antenas>();
            ANT_Expedientes expediente = await _context.ANT_Expedientes
                .Include(e => e.Antenas)
                .FirstOrDefaultAsync(e => e.IdExpediente == idAntena);
            return new List<ANT_Antenas> { expediente.Antenas };
        }

        public Task AddAntena(int idExpediente, int idAntena)
        {
            ANT_Expedientes expediente = _context.ANT_Expedientes.Find(idExpediente);
            ANT_Antenas antena = _context.ANT_Antenas.Find(idAntena);
            expediente.Antenas = antena;
            antena.Expediente = expediente;
            _context.SaveChanges();
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<ANT_EstadoTramite>> GetEstado(int idEstado)
        {
            ANT_Expedientes expediente = await _context.ANT_Expedientes
                .Include(e => e.EstadoTramite)
                .FirstOrDefaultAsync(e => e.IdExpediente == idEstado);
            return new List<ANT_EstadoTramite> { expediente.EstadoTramite };
        }

        public Task DeleteAntena(int idExpediente, int idAntena)
        {
            using var transaction = _context.Database.BeginTransaction();

            try
            {
                ANT_Expedientes expediente = _context.ANT_Expedientes.Find(idExpediente);
                ANT_Antenas antena = _context.ANT_Antenas.Find(idAntena);
                if (expediente != null && antena != null)
                {
                    expediente.Antenas = null;
                    antena.Expediente = null;
                    _context.SaveChanges();
                }
            }
            catch (Exception)
            {
                // TODO: Handle failure
                throw new System.NotImplementedException();
            }
            return Task.CompletedTask;
        }
    }
}