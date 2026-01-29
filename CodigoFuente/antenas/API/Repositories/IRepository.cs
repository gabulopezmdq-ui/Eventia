using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace API.Repositories
{
    public interface IRepository<T> : IDisposable where T : class
    {
        IQueryable<T> AllAsNoTracking();

        Task<IEnumerable<T>> Find(Expression<Func<T, bool>> expr);

        Task<T> Find(Guid id);

        Task<T> Find(int id);

        Task<T> FindLong(long id);

        Task<T> FindShort(short id);

        // ✅ CAMBIO: ya lo tenías, lo dejamos porque sirve para cualquier PK
        Task<T> FindByIdAsync(object id);

        // ✅ CAMBIO: agregado por vos (opcional). Útil si alguna vez borrás físico por id genérico.
        Task DeleteByIdAsync(object id);

        Task Add(T entity);

        Task AddWithImage(T entity);

        Task Delete(Guid Id);

        Task Delete(int Id);

        Task<T> Update(T entity);

        Task<IEnumerable<TResult>> GetAllDTO<TResult>(
            Expression<Func<T, bool>>? criterio,
            Expression<Func<T, TResult>>? selector,
            bool? orderbydescendin,
            int? page,
            int? limit,
            params Expression<Func<T, Object>>[]? order) where TResult : class;

        Task<IEnumerable<T>> GetAllAsync();

        int Count(Expression<Func<T, bool>> criterio);

        //// ✅ CAMBIO CRÍTICO: antes era int, ahora object (para PK short/long/guid)
        //Task<bool> HasRelatedEntities(object id);

        PropertyInfo GetPrimaryKeyProperty(T entity);
    }
}
