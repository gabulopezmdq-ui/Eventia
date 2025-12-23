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

            // Verificar si hay entidades relacionadas con Vigente = "S"
            bool tieneRelacionesActivas = await TieneRelacionesActivas(Id);

            if (tieneRelacionesActivas)
            {
                throw new InvalidOperationException(
                    "No se puede desactivar el registro porque existen entidades relacionadas activas (Vigente = 'S').");
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
                var originalVigente = vigenteProperty?.GetValue(originalEntity)?.ToString();
                var newVigente = vigenteProperty?.GetValue(genericClass)?.ToString();

                // Validar si el campo 'Vigente' ha cambiado de "S" a "N"
                if (vigenteProperty != null && originalVigente == "S" && newVigente == "N")
                {
                    // Verificar si hay entidades relacionadas con Vigente = "S"
                    bool tieneRelacionesActivas = await TieneRelacionesActivas(Convert.ToInt32(id));

                    if (tieneRelacionesActivas)
                    {
                        throw new InvalidOperationException("No se puede cambiar el estado 'Vigente' a 'N' porque existen entidades relacionadas con 'Vigente' = 'S'.");
                    }
                }

                // Actualizar la entidad
                return await _genericRepo.Update(genericClass);
            }
            catch (Exception e)
            {
                throw new Exception("Error al actualizar la entidad.", e);
            }
        }

        // Nuevo método para verificar relaciones activas
        private async Task<bool> TieneRelacionesActivas(int id)
        {
            var entityType = typeof(T);
            var navigationProperties = _context.Model.FindEntityType(entityType)?.GetNavigations();

            if (navigationProperties == null)
            {
                return false;
            }

            foreach (var navigation in navigationProperties)
            {
                var relatedEntityType = navigation.TargetEntityType.ClrType;

                // Verificar si la entidad relacionada tiene propiedad 'Vigente'
                var vigenteProp = relatedEntityType.GetProperty("Vigente");
                if (vigenteProp == null)
                {
                    continue; // Saltar relaciones que no tienen propiedad Vigente
                }

                // Obtener el DbSet de la entidad relacionada
                var dbSetMethod = _context.GetType().GetMethods()
                    .FirstOrDefault(m => m.Name == "Set" &&
                                        m.IsGenericMethod &&
                                        m.GetGenericArguments().Length == 1 &&
                                        m.GetParameters().Length == 0);

                if (dbSetMethod == null) continue;

                var genericDbSetMethod = dbSetMethod.MakeGenericMethod(relatedEntityType);
                var dbSet = genericDbSetMethod.Invoke(_context, null) as IQueryable;

                if (dbSet == null) continue;

                // Construir expresión para la consulta
                var parameter = Expression.Parameter(relatedEntityType, "e");

                // Expresión para la clave foránea
                Expression foreignKeyProperty;
                try
                {
                    foreignKeyProperty = Expression.Property(parameter, navigation.ForeignKey.Properties.First().Name);
                }
                catch
                {
                    foreignKeyProperty = Expression.Call(
                        typeof(EF),
                        nameof(EF.Property),
                        new[] { typeof(int) },
                        parameter,
                        Expression.Constant(navigation.ForeignKey.Properties.First().Name)
                    );
                }

                // Expresión para la propiedad Vigente
                Expression vigentePropertyExpr;
                try
                {
                    vigentePropertyExpr = Expression.Property(parameter, vigenteProp);
                }
                catch
                {
                    vigentePropertyExpr = Expression.Call(
                        typeof(EF),
                        nameof(EF.Property),
                        new[] { typeof(string) },
                        parameter,
                        Expression.Constant("Vigente")
                    );
                }

                // Condición: FK igual al ID Y Vigente = "S"
                var equals = Expression.Equal(foreignKeyProperty, Expression.Constant(id));
                var vigenteEqualsS = Expression.Equal(vigentePropertyExpr, Expression.Constant("S"));
                var combinedCondition = Expression.AndAlso(equals, vigenteEqualsS);

                var lambda = Expression.Lambda(combinedCondition, parameter);

                // Usar Any para verificar si hay dependientes activos
                var anyMethod = typeof(Queryable).GetMethods()
                    .First(m => m.Name == "Any" &&
                               m.GetParameters().Length == 2 &&
                               m.GetParameters()[1].ParameterType.Name == "Expression`1")
                    .MakeGenericMethod(relatedEntityType);

                var hasActiveDependents = (bool)anyMethod.Invoke(null, new object[] { dbSet, lambda });

                if (hasActiveDependents)
                {
                    throw new InvalidOperationException($"No se puede eliminar el registro porque tiene relaciones activas en {relatedEntityType.Name}.");
                    return true;
                }
            }

            return false;
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
                    throw new InvalidOperationException($"No se puede eliminar el registro porque la relación {relatedEntityType.Name} está vacía o inconsistente.");
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
        public async Task<bool> UpdateVigenteAsync(int entityId, T entityToUpdate)
        {
            // 1. Buscar la entidad original en la base de datos
            var entity = await _context.Set<T>().FindAsync(entityId);
            if (entity == null)
            {
                throw new Exception("Entidad no encontrada.");
            }

            // 2. Verificar si la entidad tiene la propiedad 'Vigente'
            var vigenteProperty = entity.GetType().GetProperty("Vigente");
            if (vigenteProperty == null)
            {
                throw new Exception("La propiedad 'Vigente' no existe en la entidad.");
            }

            // 3. Recuperar los valores de 'Vigente'
            var currentVigenteValue = vigenteProperty.GetValue(entity).ToString();
            var newVigenteValue = vigenteProperty.GetValue(entityToUpdate).ToString();

            // 4. Verificar si se intenta cambiar de 'S' a 'N'
            if (currentVigenteValue == "S" && newVigenteValue == "N")
            {
                // 5. Verificar si la entidad tiene relaciones
                var navigationProperties = _context.Model.FindEntityType(typeof(T)).GetNavigations();

                foreach (var navigation in navigationProperties)
                {
                    // 6. Verificar si la relación es hacia adelante (la entidad actual es la principal)
                    if (navigation.ForeignKey.PrincipalEntityType.IsAssignableFrom(navigation.TargetEntityType))
                    {
                        // 7. Obtener el tipo de la entidad dependiente
                        var dependentType = navigation.TargetEntityType.ClrType;

                        // 8. Obtener el DbSet de forma dinámica
                        var dbSetMethod = typeof(DbContext).GetMethod("Set").MakeGenericMethod(dependentType);
                        var dbSet = dbSetMethod.Invoke(_context, null) as IQueryable;

                        // 9. Construir la expresión para verificar entidades dependientes
                        var parameter = Expression.Parameter(dependentType, "e");
                        var foreignKeyProperty = Expression.Property(parameter, navigation.ForeignKey.Properties.First().Name);
                        var equals = Expression.Equal(foreignKeyProperty, Expression.Constant(entityId));

                        // 10. Verificar si la entidad dependiente tiene propiedad 'Vigente'
                        var vigenteProp = dependentType.GetProperty("Vigente");
                        if (vigenteProp != null)
                        {
                            // 11. Filtrar solo entidades dependientes con Vigente = "S"
                            var vigentePropertyExpr = Expression.Property(parameter, vigenteProp);
                            var vigenteEqualsS = Expression.Equal(vigentePropertyExpr, Expression.Constant("S"));
                            var combinedCondition = Expression.AndAlso(equals, vigenteEqualsS);

                            var lambda = Expression.Lambda(combinedCondition, parameter);

                            // 12. Usar Any para verificar si hay dependientes activos
                            var anyMethod = typeof(Queryable).GetMethods()
                                .First(m => m.Name == "Any" && m.GetParameters().Length == 2)
                                .MakeGenericMethod(dependentType);

                            var hasActiveDependents = (bool)anyMethod.Invoke(null, new object[] { dbSet, lambda });

                            if (hasActiveDependents)
                            {
                                throw new Exception($"No se puede actualizar 'Vigente' de 'S' a 'N' porque hay registros dependientes activos (Vigente = 'S') en la relación {navigation.Name}.");
                            }
                        }
                        else
                        {
                            // Si la entidad dependiente no tiene propiedad 'Vigente', consideramos que está activa por defecto
                            var lambda = Expression.Lambda(equals, parameter);

                            var anyMethod = typeof(Queryable).GetMethods()
                                .First(m => m.Name == "Any" && m.GetParameters().Length == 2)
                                .MakeGenericMethod(dependentType);

                            var hasDependents = (bool)anyMethod.Invoke(null, new object[] { dbSet, lambda });

                            if (hasDependents)
                            {
                                throw new Exception($"No se puede actualizar 'Vigente' de 'S' a 'N' porque hay registros dependientes en la relación {navigation.Name}.");
                            }
                        }
                    }
                }
            }

            // 13. Si todo está bien, actualizar la entidad
            _context.Entry(entity).CurrentValues.SetValues(entityToUpdate);
            await _context.SaveChangesAsync();
            return true;
        }


        ////Este es el método de actualización genérico que se usará sin cambios en el controlador
        //public async Task<bool> Update(T entityToUpdate)
        //{
        //    try
        //    {
        //        // Obtén el tipo de la entidad
        //        var entityType = _context.Model.FindEntityType(typeof(T));

        //        // Obtén la propiedad que es la clave primaria
        //        var primaryKey = entityType.FindPrimaryKey();
        //        var keyProperty = primaryKey?.Properties.FirstOrDefault(); // La primera propiedad en la clave primaria

        //        if (keyProperty == null)
        //        {
        //            return false; // Si no se encuentra la clave primaria, devolvemos false
        //        }

        //        // Obtén el valor de la clave primaria de la entidad
        //        var entityKey = _context.Entry(entityToUpdate).Property(keyProperty.Name).CurrentValue;

        //        // Buscar la entidad en la base de datos
        //        var entity = await _context.Set<T>().FindAsync(entityKey);

        //        if (entity == null)
        //        {
        //            return false; // Si la entidad no se encuentra, devolvemos false
        //        }

        //        // Verificar el valor actual de "Vigente"
        //        var vigenteProperty = entity.GetType().GetProperty("Vigente");
        //        if (vigenteProperty == null)
        //        {
        //            return false; // Si no se encuentra la propiedad 'Vigente', devolvemos false
        //        }

        //        var currentVigenteValue = vigenteProperty.GetValue(entity).ToString();
        //        var newVigenteValue = vigenteProperty.GetValue(entityToUpdate).ToString();

        //        // Si se intenta cambiar de 'S' a 'N', validar dependencias
        //        if (currentVigenteValue == "S" && newVigenteValue == "N")
        //        {
        //            // Verificar si existen entidades dependientes
        //            var hasDependencies = await HasDependentEntities(entityKey);

        //            // Si hay dependencias, no se permite cambiar 'Vigente' y devolvemos un mensaje de advertencia o error
        //            if (hasDependencies)
        //            {
        //                // Lanza un error o advertencia
        //                throw new InvalidOperationException("No se puede cambiar el valor de 'Vigente' de 'S' a 'N' porque existen registros dependientes.");
        //            }
        //        }

        //        // Si no hay dependencias y 'Vigente' no está siendo modificado de 'S' a 'N', actualizamos todos los valores
        //        _context.Entry(entity).CurrentValues.SetValues(entityToUpdate);

        //        // Asegurarnos de que no se modifique el campo 'Vigente' de 'S' a 'N' si hay dependencias
        //        if (currentVigenteValue == "S" && newVigenteValue == "N")
        //        {
        //            _context.Entry(entity).Property("Vigente").IsModified = false; // No permitir modificación de 'Vigente'
        //        }
        //        else
        //        {
        //            // Permitir la modificación si no hay dependencias
        //            _context.Entry(entity).Property("Vigente").IsModified = true;
        //        }

        //        // Guardar cambios en la base de datos
        //        await _context.SaveChangesAsync();

        //        return true; // La actualización fue exitosa
        //    }
        //    catch (Exception ex)
        //    {
        //        // Si ocurre una excepción, devolvemos false
        //        return false; // O lanzar la excepción: throw;
        //    }
        //}

        //private async Task<bool> HasDependentEntities(object entityKey)
        //{
        //    try
        //    {
        //        // Verificar si existen entidades que dependan de esta clave primaria
        //        var navigationProperties = _context.Model.FindEntityType(typeof(T)).GetNavigations();

        //        foreach (var navigation in navigationProperties)
        //        {
        //            // Si la relación tiene una clave foránea apuntando a la entidad
        //            if (navigation.ForeignKey.PrincipalEntityType.IsAssignableFrom(navigation.TargetEntityType))
        //            {
        //                var relatedEntityType = navigation.TargetEntityType.ClrType;
        //                var relatedEntityPrimaryKeyName = _context.Model.FindEntityType(relatedEntityType).FindPrimaryKey().Properties.First().Name;

        //                // Verificar si existen entidades dependientes con la clave foránea
        //                var dependentEntities = await _context.Set<T>()
        //                    .Where(e => EF.Property<object>(e, navigation.ForeignKey.PrincipalKey.Properties.First().Name) == entityKey)
        //                    .ToListAsync();

        //                if (dependentEntities.Any())
        //                {
        //                    return true; // Hay dependencias, no se puede actualizar Vigente
        //                }
        //            }
        //        }

        //        return false; // No hay dependencias
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new InvalidOperationException($"Error al verificar las dependencias: {ex.Message}", ex);
        //    }
        //}
    }

        // Este método es para aplicar la lógica de actualización de 'Vigente' antes de la actualización genérica
        //public async Task<bool> UpdateWithVigenteAsync(int entityId, string vigenteValue, T entidad)
        //{
        //    // Llamamos a la función que valida y actualiza 'Vigente'
        //    var result = await UpdateVigenteAsync(entityId, vigenteValue);

        //    if (result)
        //    {
        //        // Si 'Vigente' se actualizó correctamente, actualizamos la entidad
        //        await Update(entidad);
        //        return true;
        //    }

        //    // Si no se pudo actualizar 'Vigente' (por las relaciones), no actualizamos la entidad
        //    return false;
        //}
    }



