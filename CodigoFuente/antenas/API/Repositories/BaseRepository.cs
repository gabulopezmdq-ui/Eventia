using  API.DataSchema;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using IdentityModel;

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
        protected DbSet<T> EntitySet
        {
            get
            {
                return _context.Set<T>();
            }
        }

        public virtual IQueryable<T> AllAsNoTracking()
        {
            return _context.Set<T>().AsNoTracking();
        }
        public async Task<IEnumerable<T>> Find(Expression<Func<T, bool>> expr)
        {
            return (IEnumerable<T>)await EntitySet.AsNoTracking().Where(expr).ToListAsync();
        }

        public virtual async Task<T> Find(Guid id)
        {
            return await _context.FindAsync<T>(id);
        }


        public virtual async Task<T> FindLong(long id)
        {
            var keyName = _context.Model.FindEntityType(typeof(T)).FindPrimaryKey().Properties
                .Select(x => x.Name)
                .Single();
            var entity = await _context.Set<T>()
           .AsNoTracking()
           .Where(e => EF.Property<long>(e, keyName) == id)
           .FirstOrDefaultAsync();
            return entity;
        }

        public virtual async Task<T> Find(int id)
        {
            var keyName = _context.Model.FindEntityType(typeof(T)).FindPrimaryKey().Properties
                .Select(x => x.Name)
                .Single();
            var entity = await _context.Set<T>()
           .AsNoTracking()
           .Where(e => EF.Property<int>(e, keyName) == id)
           .FirstOrDefaultAsync();
            return entity;
        }

        public async Task Add(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid Id)
        {
            var post = await _context.Set<T>().FindAsync(Id);

            _context.Set<T>().Remove(post);

            await _context.SaveChangesAsync();
        }

        public async Task Delete(int Id)
        {
            var post = await _context.Set<T>().FindAsync(Id);

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
                // Obtener el archivo de la propiedad IFormFile (suponemos que se llama "Archivo")
                IFormFile archivo = propiedadArchivo.GetValue(entity) as IFormFile;

                if (archivo != null)
                {
                    byte[] datosArchivo;

                    // Convertir el archivo a un arreglo de bytes
                    using (var memoryStream = new MemoryStream())
                    {
                        archivo.CopyTo(memoryStream);
                        datosArchivo = memoryStream.ToArray();
                    }

                    // Buscar una propiedad de tipo byte[] en la entidad para almacenar los datos del archivo
                    PropertyInfo propiedadDatosArchivo = typeof(T).GetProperties()
                        .FirstOrDefault(p => p.PropertyType == typeof(byte[]));

                    if (propiedadDatosArchivo != null)
                    {
                        // Asignar los datos del archivo a la propiedad correspondiente de la entidad
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

        public async Task<IEnumerable<TResult>> GetAllDTO<TResult>(Expression<Func<T, bool>>? criterio, Expression<Func<T, TResult>>? selector, bool? orderbydescending, int? page, int? limit, params Expression<Func<T, Object>>[]? order) where TResult : class
        {
            IQueryable<T> query = EntitySet.AsQueryable();
            if (criterio != null)
            {
                query = (IQueryable<T>)query.Where(criterio);
            }
            if (order != null)
            {
                if (orderbydescending == true)
                {
                    var ordenado = query.OrderByDescending(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenByDescending(order[i]);
                    }
                    query = ordenado;
                }
                else
                {
                    var ordenado = query.OrderBy(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ((IOrderedQueryable<T>)ordenado).ThenBy(order[i]);
                    }
                    query = ordenado;
                }
            }
            IQueryable<TResult> queryFinal = selector != null ? query.Select(selector) : (IQueryable<TResult>)query;

            if (page != null)
            {
                queryFinal = queryFinal.Skip((page.Value) * limit.Value).Take(limit.Value);
            }
            return (IEnumerable<TResult>)await queryFinal.ToListAsync();
        }

        public int Count(Expression<Func<T, bool>>? criterio)
        {
            int cant = 0;
            if (criterio != null)
            {
                cant = EntitySet.Where(criterio).Count();
            }
            else
            {
                cant = EntitySet.Count();
            }
            return cant;
        }
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<bool> HasRelatedEntities(int id)
        {
            var entityType = typeof(T);
            var navigationProperties = _context.Model.FindEntityType(entityType)?.GetNavigations();

            if (navigationProperties == null)
            {
                return false; // No hay propiedades de navegación, por lo tanto, no hay entidades relacionadas.
            }

            foreach (var navigation in navigationProperties)
            {
                // Obtiene el tipo de la entidad relacionada.
                var relatedEntityType = navigation.TargetEntityType.ClrType;

                // Obtiene la propiedad de la clave foránea.
                var foreignKeyProperty = navigation.ForeignKey.Properties.FirstOrDefault();
                if (foreignKeyProperty == null)
                {
                    continue; // Si no hay clave foránea, saltamos esta relación.
                }

                // Utilizamos la versión genérica correcta de 'Set<T>()'
                var relatedDbSetMethod = _context.GetType()
                    .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                    .FirstOrDefault(m => m.Name == "Set" && m.IsGenericMethod && m.GetGenericArguments().Length == 1);

                if (relatedDbSetMethod == null)
                {
                    continue; // Si no se puede encontrar el método 'Set', continuamos con la siguiente relación.
                }

                // Invoca el DbSet de la entidad relacionada.
                var relatedDbSet = relatedDbSetMethod.MakeGenericMethod(relatedEntityType)
                    .Invoke(_context, null) as IQueryable;
                if (relatedDbSet == null)
                {
                    continue;
                }

                // Construye una expresión para la consulta.
                var parameter = Expression.Parameter(relatedEntityType, "e");

                // Acceso dinámico a la propiedad de clave foránea.
                var propertyAccess = Expression.Call(
                    typeof(EF),
                    nameof(EF.Property),
                    new[] { foreignKeyProperty.PropertyInfo.PropertyType },
                    parameter,
                    Expression.Constant(foreignKeyProperty.Name)
                );

                var condition = Expression.Equal(propertyAccess, Expression.Constant(id));
                var lambda = Expression.Lambda(condition, parameter);

                // Usamos el método `Any` para verificar si existe alguna entidad relacionada.
                var method = typeof(Queryable).GetMethods()
                    .First(m => m.Name == "Any" && m.GetParameters().Length == 2)
                    .MakeGenericMethod(relatedEntityType);

                var exists = (bool)method.Invoke(null, new object[] { relatedDbSet, lambda });

                if (exists)
                {
                    return true; // Si se encuentra alguna entidad relacionada, retornamos true.
                }
            }

            return false; // Si no se encontró ninguna relación, retornamos false.
        }
        public PropertyInfo GetPrimaryKeyProperty(T entity)
        {
            var model = _context.Model;
            var entityType = model.FindEntityType(typeof(T));

            var primaryKey = entityType.FindPrimaryKey();

            if (primaryKey == null)
            {
                throw new InvalidOperationException("No se encontró una clave primaria configurada.");
            }

            var primaryKeyProperty = entity.GetType().GetProperty(primaryKey.Properties[0].Name);

            return primaryKeyProperty;
        }


    }
}