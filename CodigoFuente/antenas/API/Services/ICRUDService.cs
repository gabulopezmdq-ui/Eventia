using  API.DataSchema;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Services
{
    public interface ICRUDService<T>
    {
        IEnumerable<T> GetAll();
        IEnumerable<T> GetAllVigente();
        Task<T> GetByID(int id);

        Task Add(T genericClass);

        Task Delete(int id);

        Task<T> Update(T genericClass);

        Task<IEnumerable<T>> GetByParam(Expression<Func<T, bool>> where);
        Task<IEnumerable<T>> GetByActivo(bool? boolValue);
        Task<IEnumerable<T>> GetAllActivos();
        Task<bool> UserDuplicate(T entity);
        Task<bool> IsUserDuplicate(T entity);
        Task<IEnumerable<T>> GetByVigente(string vigenteStatus = null);

    }
}