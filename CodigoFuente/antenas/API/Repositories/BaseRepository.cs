using API.DataSchema;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace API.Repositories
{
    public class BaseRepository<T> : IRepository<T>
        where T : class
    {
        protected readonly DataContext _context;

        public BaseRepository(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        protected DbSet<T> EntitySet => _context.Set<T>();

        public virtual IQueryable<T> AllAsNoTracking()
        {
            return _context.Set<T>().AsNoTracking();
        }

        public async Task<IEnumerable<T>> Find(Expression<Func<T, bool>> expr)
        {
            return await EntitySet.AsNoTracking().Where(expr).ToListAsync();
        }

        public virtual async Task<T> Find(Guid id)
        {
            // ✅ CAMBIO: FindAsync directo funciona perfecto para Guid PK
            return await _context.Set<T>().FindAsync(id);
        }

        public virtual async Task<T> FindShort(short id)
        {
            var keyName = _context.Model.FindEntityType(typeof(T))!
                .FindPrimaryKey()!
                .Properties.Select(x => x.Name)
                .Single();

            return await _context.Set<T>()
                .AsNoTracking()
                .Where(e => EF.Property<short>(e, keyName) == id)
                .FirstOrDefaultAsync();
        }

        public virtual async Task<T> FindLong(long id)
        {
            var keyName = _context.Model.FindEntityType(typeof(T))!
                .FindPrimaryKey()!
                .Properties.Select(x => x.Name)
                .Single();

            return await _context.Set<T>()
                .AsNoTracking()
                .Where(e => EF.Property<long>(e, keyName) == id)
                .FirstOrDefaultAsync();
        }

        public virtual async Task<T> Find(int id)
        {
            var keyName = _context.Model.FindEntityType(typeof(T))!
                .FindPrimaryKey()!
                .Properties.Select(x => x.Name)
                .Single();

            return await _context.Set<T>()
                .AsNoTracking()
                .Where(e => EF.Property<int>(e, keyName) == id)
                .FirstOrDefaultAsync();
        }

        public async Task<T> FindByIdAsync(object id)
        {
            // ✅ devuelve SIN tracking, evita choque en Update
            var entityType = _context.Model.FindEntityType(typeof(T))
                ?? throw new InvalidOperationException($"No se encontró metadata para {typeof(T).Name}.");

            var pk = entityType.FindPrimaryKey()
                ?? throw new InvalidOperationException($"La entidad {typeof(T).Name} no tiene PK.");

            var pkProp = pk.Properties[0];
            var pkName = pkProp.Name;
            var pkClrType = pkProp.ClrType;

            var typedId = Convert.ChangeType(id, pkClrType);

            var parameter = Expression.Parameter(typeof(T), "e");

            // EF.Property<TPk>(e, "Id")
            var propertyAccess = Expression.Call(
                typeof(EF),
                nameof(EF.Property),
                new[] { pkClrType },
                parameter,
                Expression.Constant(pkName)
            );

            var equals = Expression.Equal(propertyAccess, Expression.Constant(typedId, pkClrType));
            var lambda = Expression.Lambda<Func<T, bool>>(equals, parameter);

            return await _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync(lambda);
        }

        public async Task DeleteByIdAsync(object id)
        {
            // ✅ CAMBIO: borrado físico genérico (opcional)
            var entity = await FindByIdAsync(id);
            if (entity == null) return;

            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Add(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid Id)
        {
            var post = await _context.Set<T>().FindAsync(Id);
            if (post == null) return;

            _context.Set<T>().Remove(post);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int Id)
        {
            var post = await _context.Set<T>().FindAsync(Id);
            if (post == null) return;

            _context.Set<T>().Remove(post);
            await _context.SaveChangesAsync();
        }

        public async Task<T> Update(T entity)
        {
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task AddWithImage(T entity)
        {
            // Buscar una propiedad de tipo IFormFile en la entidad
            PropertyInfo propiedadArchivo = typeof(T).GetProperties()
                .FirstOrDefault(p => p.PropertyType == typeof(IFormFile));

            if (propiedadArchivo != null)
            {
                IFormFile archivo = propiedadArchivo.GetValue(entity) as IFormFile;

                if (archivo != null)
                {
                    byte[] datosArchivo;

                    using (var memoryStream = new MemoryStream())
                    {
                        archivo.CopyTo(memoryStream);
                        datosArchivo = memoryStream.ToArray();
                    }

                    PropertyInfo propiedadDatosArchivo = typeof(T).GetProperties()
                        .FirstOrDefault(p => p.PropertyType == typeof(byte[]));

                    if (propiedadDatosArchivo != null)
                    {
                        propiedadDatosArchivo.SetValue(entity, datosArchivo);
                    }
                }
            }

            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                _context.Dispose();
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public async Task<IEnumerable<TResult>> GetAllDTO<TResult>(
            Expression<Func<T, bool>>? criterio,
            Expression<Func<T, TResult>>? selector,
            bool? orderbydescending,
            int? page,
            int? limit,
            params Expression<Func<T, Object>>[]? order) where TResult : class
        {
            IQueryable<T> query = EntitySet.AsQueryable();

            if (criterio != null)
                query = query.Where(criterio);

            if (order != null && order.Length > 0)
            {
                if (orderbydescending == true)
                {
                    var ordenado = query.OrderByDescending(order[0]);
                    for (int i = 1; i < order.Length; i++)
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenByDescending(order[i]);
                    query = ordenado;
                }
                else
                {
                    var ordenado = query.OrderBy(order[0]);
                    for (int i = 1; i < order.Length; i++)
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenBy(order[i]);
                    query = ordenado;
                }
            }

            IQueryable<TResult> queryFinal = selector != null ? query.Select(selector) : (IQueryable<TResult>)query;

            if (page != null)
                queryFinal = queryFinal.Skip(page.Value * limit.Value).Take(limit.Value);

            return await queryFinal.ToListAsync();
        }

        public int Count(Expression<Func<T, bool>> criterio)
        {
            return criterio != null ? EntitySet.Where(criterio).Count() : EntitySet.Count();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }

        // ✅ CAMBIO CRÍTICO: antes era int y te rompía con short/long
        // ✅ CAMBIO CRÍTICO: arreglado para DbSet por Type (reflection)
        //public async Task<bool> HasRelatedEntities(object id)
        //{
        //    var entityType = typeof(T);
        //    var navigationProperties = _context.Model.FindEntityType(entityType)?.GetNavigations();

        //    if (navigationProperties == null)
        //        return false;

        //    foreach (var navigation in navigationProperties)
        //    {
        //        var relatedEntityType = navigation.TargetEntityType.ClrType;

        //        var foreignKeyProperty = navigation.ForeignKey.Properties.FirstOrDefault();
        //        if (foreignKeyProperty == null)
        //            continue;

        //        // ✅ CAMBIO: obtener IQueryable del DbSet<relatedEntityType> via reflection
        //        var relatedDbSet = GetQueryable(relatedEntityType);
        //        if (relatedDbSet == null)
        //            continue;

        //        var parameter = Expression.Parameter(relatedEntityType, "e");

        //        // EF.Property<TFk>(e, "FkName")
        //        var fkType = foreignKeyProperty.ClrType;
        //        var propertyAccess = Expression.Call(
        //            typeof(EF),
        //            nameof(EF.Property),
        //            new[] { fkType },
        //            parameter,
        //            Expression.Constant(foreignKeyProperty.Name)
        //        );

        //        var typedId = Convert.ChangeType(id, fkType);

        //        var condition = Expression.Equal(propertyAccess, Expression.Constant(typedId, fkType));
        //        var lambda = Expression.Lambda(condition, parameter);

        //        var anyMethod = typeof(Queryable).GetMethods()
        //            .First(m => m.Name == "Any" && m.GetParameters().Length == 2)
        //            .MakeGenericMethod(relatedEntityType);

        //        var exists = (bool)anyMethod.Invoke(null, new object[] { relatedDbSet, lambda });

        //        if (exists)
        //            return true;
        //    }

        //    return false;
        //}

        public PropertyInfo GetPrimaryKeyProperty(T entity)
        {
            var model = _context.Model;
            var entityType = model.FindEntityType(typeof(T));

            var primaryKey = entityType?.FindPrimaryKey();
            if (primaryKey == null)
                throw new InvalidOperationException("No se encontró una clave primaria configurada.");

            return entity.GetType().GetProperty(primaryKey.Properties[0].Name);
        }

        // ✅ NUEVO: helper para que FindByIdAsync funcione con PK short/int/long/guid
        private object CastToPrimaryKeyType(object id)
        {
            var entityType = _context.Model.FindEntityType(typeof(T))
                ?? throw new InvalidOperationException($"No se encontró metadata para {typeof(T).Name}.");

            var pk = entityType.FindPrimaryKey()
                ?? throw new InvalidOperationException($"La entidad {typeof(T).Name} no tiene PK.");

            var pkType = pk.Properties[0].ClrType;

            // Si ya viene del mismo tipo, perfecto
            if (id != null && pkType.IsInstanceOfType(id))
                return id;

            return Convert.ChangeType(id, pkType);
        }
    }
}
