using  API.DataSchema;
using  API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using API.DataSchema.Interfaz;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using System.Reflection;
using System.ComponentModel.DataAnnotations;


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
<<<<<<< HEAD
                //.Where(x => EF.Property<string>(x, "Vigente") == "S");
=======
            //.Where(x => EF.Property<string>(x, "Vigente") == "S");
>>>>>>> a02644dad39404e1341f59561a8eb4813b7c81c8

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

            bool tieneEntidadAsociada = await _genericRepo.HasRelatedEntities(Id);

            if (tieneEntidadAsociada)
            {
                throw new InvalidOperationException("No se puede eliminar el registro");
            }

            // Cambia el estado 'Vigente' a "N" en lugar de eliminar físicamente
            typeof(T).GetProperty("Vigente")?.SetValue(entity, "N");

            // Guarda los cambios en la base de datos
            await _genericRepo.Update(entity);
        }
        public async Task DeleteUsuario(int Id)
        {
            // Obtiene el registro por su ID
            var entity = await _genericRepo.Find(Id);

            // Verifica si se encontró la entidad
            if (entity == null)
            {
                throw new KeyNotFoundException("El registro no existe.");
            }

            // Cambia el estado 'Vigente' a "N" en lugar de eliminar físicamente
            typeof(T).GetProperty("Activo")?.SetValue(entity, false);

            // Guarda los cambios en la base de datos
            await _genericRepo.Update(entity);
        }
        public virtual async Task<T> Update(T genericClass)
        {
            try
            {
                // Usamos la nueva lógica para obtener la propiedad de la clave primaria desde el repositorio
                var primaryKeyProperty = _genericRepo.GetPrimaryKeyProperty(genericClass);

                if (primaryKeyProperty == null)
                {
                    throw new InvalidOperationException("No se encontró una clave primaria en la entidad.");
                }

                // Obtener el valor de la clave primaria
                var id = primaryKeyProperty.GetValue(genericClass);

                if (id == null)
                {
                    throw new ArgumentNullException("La clave primaria no puede ser nula.");
                }

                // Verificar si existen entidades relacionadas antes de actualizar
                bool tieneEntidadAsociada = await _genericRepo.HasRelatedEntities((int)id);

                if (tieneEntidadAsociada)
                {
                    throw new InvalidOperationException("No se puede actualizar el registro porque está asociado con otras entidades.");
                }

                // Obtener la entidad desde la base de datos antes de hacer el update
                T originalEntity;
                if (id is int intId)
                {
                    originalEntity = await _genericRepo.Find(intId);  // Usar el método Find(int id) del repositorio
                }
                else if (id is Guid guidId)
                {
                    originalEntity = await _genericRepo.Find(guidId);  // Usar el método Find(Guid id) del repositorio
                }
                else
                {
                    throw new InvalidOperationException("Tipo de clave primaria no soportado.");
                }

                if (originalEntity == null)
                {
                    throw new InvalidOperationException("Entidad no encontrada");
                }

                // Obtener el valor de 'Vigente' antes de actualizar
                var originalVigente = originalEntity.GetType().GetProperty("Vigente")?.GetValue(originalEntity, null);
                var newVigente = genericClass.GetType().GetProperty("Vigente")?.GetValue(genericClass, null);

                // Mostrar o procesar el valor original de 'Vigente' antes del update
                Console.WriteLine($"Valor de 'Vigente' antes del update: {originalVigente}");

                // Si el estado 'Vigente' no se está modificando, no es necesario actualizarlo
                if (originalVigente != newVigente)
                {
                    // Realizar el update utilizando el repositorio
                    return await _genericRepo.Update(genericClass);  // Usar el método Update del repositorio
                }
                else
                {
                    // Si el estado 'Vigente' no ha cambiado, también proceder con la actualización
                    return await _genericRepo.Update(genericClass);  // Usar el método Update del repositorio
                }
            }
            catch (Exception e)
            {
                throw e;  // Puedes agregar más detalles de la excepción si lo necesitas
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
        public async Task<bool> HasRelatedEntities(int id)
        {
            // Llamar al método HasRelatedEntities del repositorio y devolver su resultado
            return await _genericRepo.HasRelatedEntities(id);
        }
    }
}
