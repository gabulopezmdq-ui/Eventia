using  API.DataSchema;
using  API.Repositories;
using API.DataSchema.Interfaz;
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
            if (await IsDuplicate(genericClass))
            {
                throw new InvalidOperationException("El registro ya existe.");
            }
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
        // Método para verificar duplicados
        private async Task<bool> IsDuplicate(T entity)
        {
            if (entity is not IEntidadUnica uniqueEntity)
            {
                throw new InvalidOperationException("La entidad no implementa IEntidadUnica.");
            }

            var parameter = Expression.Parameter(typeof(T), "e");
            var conditions = new List<Expression>();

            foreach (var uniquePropertySet in uniqueEntity.PropUnica)
            {
                var innerConditions = new List<Expression>();

                foreach (var property in uniquePropertySet)
                {
                    var propertyInfo = typeof(T).GetProperty(property);
                    if (propertyInfo == null)
                    {
                        throw new ArgumentException($"La entidad no contiene un campo '{property}'.");
                    }

                    var value = propertyInfo.GetValue(entity);
                    var propertyExpression = Expression.Property(parameter, property);
                    var equalExpression = Expression.Equal(propertyExpression, Expression.Constant(value));
                    innerConditions.Add(equalExpression);
                }

                // Combina las condiciones para la propiedad única actual
                var combinedCondition = innerConditions.Aggregate((current, next) => Expression.AndAlso(current, next));
                conditions.Add(combinedCondition);
            }

            // Combina todas las condiciones en una sola expresión
            var finalCondition = conditions.Aggregate((current, next) => Expression.OrElse(current, next));
            var predicate = Expression.Lambda<Func<T, bool>>(finalCondition, parameter);

            // Ejecutar la consulta usando el predicado
            return await _genericRepo.Find(predicate) != null;
        }
    }
}