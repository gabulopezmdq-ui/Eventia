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
            return _genericRepo.AllAsNoTracking().Where(x => EF.Property<string>(x, "Vigente") == "S");

        }

        public IEnumerable<T> GetAllVigente()
        {
            return _genericRepo.AllAsNoTracking();
        }
        public async Task<IEnumerable<T>> GetByVigente(string vigenteStatus = null)
        {
            var query = _genericRepo.AllAsNoTracking();

            if (!string.IsNullOrEmpty(vigenteStatus))
            {
                // Filtra solo si el estado de "Vigente" es proporcionado ("S" o "N")
                query = query.Where(x => EF.Property<string>(x, "Vigente") == vigenteStatus);
            }
            // Si el valor es nulo o vacío, retorna todos sin aplicar filtro
            return await Task.FromResult(query);
        }
        public async Task<IEnumerable<T>> GetAllActivos()
        {
            return await Task.FromResult(_genericRepo.AllAsNoTracking().Where(x => EF.Property<bool>(x, "Activo") == true));
        }

        // Método GetAll genérico con filtro opcional
        public async Task<IEnumerable<T>> GetByActivo(bool? boolValue)
        {
            if (!boolValue.HasValue)
            {
                // Si boolValue es null, retornamos todos los usuarios
                return await Task.FromResult(_genericRepo.AllAsNoTracking());
            }

            // Si boolValue tiene valor (true o false), filtramos por 'Activo'
            return await Task.FromResult(
                _genericRepo.AllAsNoTracking()
                    .Where(x => EF.Property<bool>(x, "Activo") == boolValue.Value)
            );
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
            // Obtiene el registro por su ID
            var entity = await _genericRepo.Find(Id);

            // Verifica si se encontró la entidad
            if (entity == null)
            {
                throw new KeyNotFoundException("El registro no existe.");
            }

            // Cambia el estado 'Vigente' a "N" en lugar de eliminar físicamente
            typeof(T).GetProperty("Vigente")?.SetValue(entity, "N");

            // Guarda los cambios en la base de datos
            await _genericRepo.Update(entity);
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
                return false;
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


        // Método para verificar duplicados de usuario
        public async Task<bool> IsUserDuplicate(T entity)
        {
            return await UserDuplicate(entity);
        }
        public async Task<bool> UserDuplicate(T entity)
        {
            if (entity is MEC_RolesXUsuarios rolesXUsuariosEntity)
            {
                // Verificar duplicados de RolesXUsuarios
                var existingEntities = await _genericRepo.GetAllAsync();
                return existingEntities.Any(x =>
                    (x as MEC_RolesXUsuarios)?.IdUsuario == rolesXUsuariosEntity.IdUsuario &&
                    (x as MEC_RolesXUsuarios)?.IdRol == rolesXUsuariosEntity.IdRol);
            }

            // No se encontró ningún duplicado para otras entidades
            return false;
        }
    }
}
