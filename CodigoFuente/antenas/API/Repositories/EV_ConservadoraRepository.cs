using Microsoft.EntityFrameworkCore;
using rsAPIElevador.DataSchema;
using rsAPIElevador.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace API.Repositories
{
    public class EV_ConservadoraRepository : BaseRepository<EV_Conservadora>, IRepository<EV_Conservadora>
    {
        public EV_ConservadoraRepository(DataContext context) : base(context)
        {

        }

        public override async Task<EV_Conservadora> Find(int id)
        {
            return await _context.EV_Conservadora.Include(x => x.EV_Maquina).AsNoTracking().FirstOrDefaultAsync(e => e.IdConservadora == id);
        }
    }
}