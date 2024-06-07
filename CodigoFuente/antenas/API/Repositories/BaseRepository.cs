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

    }
}