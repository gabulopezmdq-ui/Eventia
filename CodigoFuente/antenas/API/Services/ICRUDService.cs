using  API.DataSchema;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace API.Services
{
    public interface ICRUDService<T>
    {
        IEnumerable<T> GetAll();
        IEnumerable<T> GetAllVigente();

        Task<T> GetByIDShort(short id);
        Task<T> GetByIDInt(int id);
        Task<T> GetByID(long id);
        Task Add(T genericClass);

        Task Delete(int id);

        Task<T> Update(T genericClass);
        //Task<bool> Update(T entityToUpdate);
        Task<IEnumerable<T>> GetByParam(Expression<Func<T, bool>> where);
        Task<IEnumerable<T>> GetByActivo(bool? boolValue);
        Task<IEnumerable<T>> GetAllActivos();
        //Task<bool> UserDuplicate(T entity);
        //Task<bool> IsUserDuplicate(T entity);
        Task<IEnumerable<T>> GetByVigente(string vigenteStatus = null);
        Task DeleteUsuario(int Id);
        //Task<bool> HasRelatedEntities(int id);

        Task<T> UpdatePOF(T genericClass);

    }
}