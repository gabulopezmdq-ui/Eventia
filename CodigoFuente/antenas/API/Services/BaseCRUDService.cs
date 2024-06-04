using  API.DataSchema;
using  API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public class BaseCRUDService<T> : ICRUDService<T>
        where T : class
    {
        internal readonly IRepository<T> _genericRepo;

        public BaseCRUDService(IRepository<T> genericRepo)
        {
            _genericRepo = genericRepo;
        }

        public IEnumerable<T> GetAll()
        {
            return _genericRepo.AllAsNoTracking();
        }


        public async Task<T> GetByID(int id)
        {
            return await _genericRepo.Find(id);
        }
        public async Task<IEnumerable<T>> GetByParam(Expression<Func<T, bool>> where)
        {
            return await _genericRepo.Find(where);
        }


        public async Task Add(T genericClass)
        {
            await _genericRepo.AddWithImage(genericClass);
        }

        public async Task Delete(int Id)
        {
            await _genericRepo.Delete(Id);
        }

        public virtual async Task<T> Update(T genericClass)
        {
            try
            {
                return await _genericRepo.Update(genericClass);
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }
    }
}