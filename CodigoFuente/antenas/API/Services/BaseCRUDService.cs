using  API.DataSchema;
using  API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using API.DataSchema.Interfaz;
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
            // Verificar si ya existe un registro similar
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
            if (entity is not IRegistroUnico uniqueEntity)
            {
                throw new InvalidOperationException("La entidad no implementa IRegistroUnico.");
            }

            foreach (var property in uniqueEntity.UniqueProperties)
            {
                var propertyInfo = typeof(T).GetProperty(property);
                if (propertyInfo == null)
                {
                    throw new ArgumentException($"La entidad no contiene un campo '{property}'.");
                }

                // Esperar a que `GetAllAsync` complete y luego trabajar en memoria
                var entities = (await _genericRepo.GetAllAsync()).AsEnumerable();

                foreach (var existingEntity in entities)
                {
                    var existingValue = propertyInfo.GetValue(existingEntity);
                    var value = propertyInfo.GetValue(entity);
                    if (existingValue != null && existingValue.Equals(value))
                    {
                        return true; // Se encontró un duplicado
                    }
                }
            }

            return false; // No se encontró ningún duplicado
        }
    }
}