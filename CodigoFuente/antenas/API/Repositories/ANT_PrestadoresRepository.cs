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
    public class ANT_PrestadoresRepository : BaseRepository<ANT_Prestadores>, IANT_PrestadoresRepository
    {

        private readonly DataContext _context;
        public ANT_PrestadoresRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<ANT_Prestadores> Find(int id)
        {
            ANT_Prestadores prestador = await _context.ANT_Prestadores
                .Include(x => x.RazonSocial)
                .Include(x => x.Cuit)
                .Include(x => x.Apoderados)
                    .ThenInclude(a => a.Nombre)
                .Include(x => x.Apoderados)
                    .ThenInclude(a => a.Apellido)
                .IgnoreAutoIncludes()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.IdPrestador == id);
            return prestador;
        }

        public async Task<IEnumerable<ANT_Apoderados>> GetApoderado (int idPrestador)
        {
            IEnumerable<ANT_Apoderados> apoderados = new List<ANT_Apoderados>();
            ANT_Prestadores prestador = new ANT_Prestadores();
            prestador = await _context.ANT_Prestadores.FindAsync(idPrestador);
            return prestador.Apoderados;
        }

        public Task AddApoderado(int idPrestador, int idApoderado)
        {
            ANT_Prestadores prestador = new ANT_Prestadores();
            prestador = _context.ANT_Prestadores.Find(idPrestador);
            ANT_Apoderados apoderado = new ANT_Apoderados();
            apoderado = _context.ANT_Apoderados.Find(idApoderado);
            prestador.Apoderados.Add(apoderado);
            _context.SaveChanges();
            return Task.CompletedTask;
        }

        public Task DeleteApoderado(int idPrestador, int idApoderado)
        {
            //primero eliminar de la relacion conservadora x reptecnico

            using var transaction = _context.Database.BeginTransaction();

            try
            {
                //accion 1

                //_context.EV_ConservadoraEV_RepTecnico.Remove(idCons, idRepTec);//algo asi seria creo que primero hay que hacer el find del objeto
                ANT_Prestadores prestador = new ANT_Prestadores();
                prestador = _context.ANT_Prestadores.Find(idPrestador);
                ANT_Apoderados apoderado = new ANT_Apoderados();
                apoderado = _context.ANT_Apoderados.Find(idApoderado);
                if (prestador != null && apoderado != null)
                {
                    prestador.Apoderados.Remove(apoderado);
                    _context.SaveChanges();
                }

            }
            catch (Exception)
            {
                // TODO: Handle failure
                throw new System.NotImplementedException();
            }
            //segundo realizar update en null sobre maquina para idreptecnico
            return Task.CompletedTask;
        }
    }
}