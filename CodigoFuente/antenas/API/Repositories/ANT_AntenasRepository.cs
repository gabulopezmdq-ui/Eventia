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
    public class ANT_AntenasRepository : BaseRepository<ANT_Antenas>, IANT_AntenasRepository
    {

        private readonly DataContext _context;
        public ANT_AntenasRepository(DataContext context) : base(context)
        {
            _context = context;
        }

         

        public async Task<IEnumerable<ANT_Antenas>> GetByPrestador(string prestador)
        {
            return await _context.ANT_Antenas
                .Include(a => a.TipoAntenas)
                .Include(a => a.Prestador)
                .Include(a => a.IdExpediente)
                .Where(a => a.Prestador.RazonSocial.Contains(prestador))
                .ToListAsync();
        }
        public async Task<IEnumerable<ANT_Inspecciones>> GetInspec (int idAntena)
        {
            IEnumerable<ANT_Inspecciones> inspecciones = new List<ANT_Inspecciones>();
            ANT_Antenas antena = new ANT_Antenas();
            antena = await _context.ANT_Antenas.FindAsync(idAntena);
            return antena.Inspecciones;
        }

        public Task AddInspec(int idAntena, int idInspeccion)
        {
            ANT_Antenas antena = new ANT_Antenas();
            antena = _context.ANT_Antenas.Find(idAntena);
            ANT_Inspecciones inspeccion = new ANT_Inspecciones();
            inspeccion = _context.ANT_Inspecciones.Find(idInspeccion);
            antena.Inspecciones.Add(inspeccion);
            _context.SaveChanges();
            return Task.CompletedTask;
        }

        public Task DeleteInspeccion(int idAntena, int idInspeccion)
        {
            //primero eliminar de la relacion conservadora x reptecnico

            using var transaction = _context.Database.BeginTransaction();

            try
            {
                //accion 1

                //_context.EV_ConservadoraEV_RepTecnico.Remove(idCons, idRepTec);//algo asi seria creo que primero hay que hacer el find del objeto
                ANT_Antenas antena = new ANT_Antenas();
                antena = _context.ANT_Antenas.Find(idAntena);
                ANT_Inspecciones inspeccion = new ANT_Inspecciones();
                inspeccion = _context.ANT_Inspecciones.Find(idInspeccion);
                if (antena != null && inspeccion != null)
                {
                    antena.Inspecciones.Remove(inspeccion);
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

        /*
        public async Task Add(EV_Conservadora conservadora)
        {

        }*/
    }
}