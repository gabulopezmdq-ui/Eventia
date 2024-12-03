using API.DataSchema;
using API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using API.DataSchema.Interfaz;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using IdentityModel;


namespace API.Services
{
    public class BaseCRUDService<T> : ICRUDService<T>
        where T : class
    {
        internal readonly IRepository<T> _genericRepo;
        protected readonly DataContext _context;


        public BaseCRUDService(IRepository<T> genericRepo, DataContext context)
        {
            _genericRepo = genericRepo;
            _context = context;
        }

        public IEnumerable<T> GetAll()
        {
            return _genericRepo.AllAsNoTracking();
            //.Where(x => EF.Property<string>(x, "Vigente") == "S");

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
                // Obtener la clave primaria de la entidad
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

                // Obtener la entidad original desde la base de datos
                T originalEntity = id switch
                {
                    int intId => await _genericRepo.Find(intId),
                    Guid guidId => await _genericRepo.Find(guidId),
                    _ => throw new InvalidOperationException("Tipo de clave primaria no soportado."),
                };

                if (originalEntity == null)
                {
                    throw new InvalidOperationException("Entidad no encontrada.");
                }

                // Obtener los valores de 'Vigente'
                var vigenteProperty = typeof(T).GetProperty("Vigente");
                var originalVigente = vigenteProperty?.GetValue(originalEntity);
                var newVigente = vigenteProperty?.GetValue(genericClass);

                // Validar si el campo 'Vigente' ha cambiado
                if (vigenteProperty != null && !Equals(originalVigente, newVigente))
                {
                    // Verificar si hay entidades relacionadas
                    bool tieneEntidadAsociada = await _genericRepo.HasRelatedEntities(Convert.ToInt32(id));

                    // Si tiene relaciones asociadas, pero esas relaciones no tienen entidades, permitimos el cambio
                    if (tieneEntidadAsociada)
                    {
                        bool tieneRelacionVacía = await TieneRelacionVacia(Convert.ToInt32(id));

                        if (tieneRelacionVacía)
                        {
                            // Si la relación está vacía, permitimos cambiar el valor de 'Vigente'
                            return await _genericRepo.Update(genericClass);
                        }
                        else
                        {
                            throw new InvalidOperationException("No se puede cambiar el estado 'Vigente' porque la entidad relacionada tiene elementos asociados.");
                        }
                    }
                    else
                    {
                        // Si no tiene ninguna relación asociada, permitimos el cambio de 'Vigente'
                        return await _genericRepo.Update(genericClass);
                    }
                }

                // Si no se modificó 'Vigente', simplemente actualizamos la entidad
                return await _genericRepo.Update(genericClass);
            }
            catch (Exception e)
            {
                throw new Exception("Error al actualizar la entidad.", e); // Lanzar una excepción con más contexto
            }
        }
        // Método para verificar si la entidad relacionada tiene alguna relación "vacía" (sin elementos asociados)
        public async Task<bool> TieneRelacionVacia(int id)
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

                // Usamos la versión genérica correcta de 'Set<T>()'
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

                if (!exists)
                {
                    return true; // Si no se encuentran entidades relacionadas, devolvemos 'true' (relación vacía)
                }
            }

            return false; // Si no se encontró ninguna relación vacía, devolvemos 'false'
        }



        // Método auxiliar para obtener el ID de la entidad
        private int GetId(T entity)
        {
            var keyName = _context.Model.FindEntityType(typeof(T))
                             ?.FindPrimaryKey()
                             ?.Properties
                             ?.Select(p => p.Name)
                             ?.FirstOrDefault();

            if (keyName == null)
            {
                throw new InvalidOperationException($"La entidad '{typeof(T).Name}' no tiene una clave primaria definida.");
            }

            var propertyInfo = typeof(T).GetProperty(keyName);
            if (propertyInfo == null)
            {
                throw new InvalidOperationException($"No se encontró la propiedad '{keyName}' en la entidad '{typeof(T).Name}'.");
            }

            return (int)propertyInfo.GetValue(entity);
        }


        // Método para verificar si la entidad relacionada tiene alguna relación "vacía" (sin elementos asociados)

        private async Task<bool> TieneRelacionVacia(int id, string foreignKeyName)
        {
            // Obtener el tipo de la entidad
            var entityType = typeof(T);

            // Obtener el DbSet dinámicamente desde el contexto
            var dbSetProperty = _context.GetType().GetProperties()
                .FirstOrDefault(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>)
                    && p.PropertyType.GetGenericArguments()[0] == entityType);

            if (dbSetProperty == null)
            {
                throw new InvalidOperationException($"No se encontró un DbSet para el tipo '{entityType.Name}'.");
            }

            var dbSet = dbSetProperty.GetValue(_context);

            // Crear una expresión dinámica para verificar las relaciones
            var parameter = Expression.Parameter(entityType, "x");
            var property = Expression.Property(parameter, foreignKeyName);
            var constant = Expression.Constant(id);
            var equals = Expression.Equal(property, constant);
            var lambda = Expression.Lambda(equals, parameter);

            // Convertir el dbSet a IQueryable dinámico
            var queryable = (IQueryable<object>)dbSet;

            // Obtener el método Where correctamente
            var whereMethod = typeof(Queryable)
                .GetMethods(BindingFlags.Public | BindingFlags.Static)
                .Where(m => m.Name == "Where" && m.GetParameters().Length == 2)
                .First()
                .MakeGenericMethod(entityType);

            // Aplicar el filtro dinámico
            var filteredQuery = (IQueryable<object>)whereMethod.Invoke(null, new object[] { queryable, lambda });

            // Ejecutar la consulta y verificar los resultados
            var relatedEntities = await filteredQuery.ToListAsync();
            return relatedEntities.Count == 0;
        }



        public virtual async Task<T> UpdatePOF(T genericClass)
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
        public async Task<bool> HasRelatedEntities(int id)
        {
            // Llamar al método HasRelatedEntities del repositorio y devolver su resultado
            return await _genericRepo.HasRelatedEntities(id);
        }

        private string GetForeignKeyName(Type entityType)
        {
            // Obtener el modelo de EF Core para el tipo especificado
            var entityTypeModel = _context.Model.FindEntityType(entityType);
            if (entityTypeModel == null)
            {
                throw new InvalidOperationException($"El tipo '{entityType.Name}' no está definido en el modelo.");
            }

            // Buscar las propiedades de clave foránea
            var foreignKey = entityTypeModel.GetForeignKeys()
                .FirstOrDefault();

            if (foreignKey == null)
            {
                throw new InvalidOperationException($"No se encontró una clave foránea en la entidad '{entityType.Name}'.");
            }

            // Devolver el nombre de la propiedad de clave foránea
            return foreignKey.Properties.FirstOrDefault()?.Name
                ?? throw new InvalidOperationException($"La clave foránea en '{entityType.Name}' no tiene una propiedad válida.");
        }


        //metodo NUEVO
        //public async Task<bool> UpdateVigenteAsync(int entityId, string vigenteValue)
        //{
        //    var entity = await _context.Set<TEntity>().FindAsync(entityId);

        //    if (entity == null)
        //        return false;

        //    var navigationProperties = _context.Model.FindEntityType(typeof(TEntity))
        //        .GetNavigations()
        //        .Where(n => n.IsOnDependent);

        //    foreach (var navigation in navigationProperties)
        //    {
        //        // Verificar si la relación es "hacia adelante"
        //        if (navigation.ForeignKey.PrincipalEntityType.IsAssignableFrom(navigation.TargetEntityType))
        //        {
        //            // Verificar si existen registros dependientes que estén activos
        //            var dependentEntity = _context.Set<TEntity>()
        //                .Where(e => EF.Property<int>(e, navigation.ForeignKey.PrincipalKey.Properties.First().Name) == entityId)
        //                .FirstOrDefault();

        //            // Si hay alguna relación activa de tipo "hacia adelante", no se puede cambiar el "Vigente" a N
        //            if (dependentEntity != null && EF.Property<string>(dependentEntity, "Vigente") == "S")
        //            {
        //                return false;  // Si la relación es activa, no permitimos cambiar a "N"
        //            }
        //        }
        //    }

        //    // Actualizar el campo "Vigente" de la entidad
        //    _context.Entry(entity).Property("Vigente").CurrentValue = vigenteValue;

        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        //public async Task<bool> Update(TEntity entidad)
        //{
        //    _context.Set<TEntity>().Update(entidad);
        //    await _context.SaveChangesAsync();
        //    return true;
        //}

    }
}

