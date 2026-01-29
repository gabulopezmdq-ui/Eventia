using API.DataSchema;
using API.DataSchema.Interfaz;
using API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

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
                // ⚠️ OJO: acá estás filtrando "activo" como string.
                // Si "activo" es bool en DB, este filtro no va a funcionar.
                query = query.Where(x => EF.Property<string>(x, "activo") == vigenteStatus);
            }

            return await Task.FromResult(query);
        }

        public async Task<IEnumerable<T>> GetAllActivos()
        {
            return await Task.FromResult(
                _genericRepo.AllAsNoTracking().Where(x => EF.Property<bool>(x, "Activo") == true)
            );
        }

        public async Task<IEnumerable<T>> GetByActivo(bool? boolValue)
        {
            if (!boolValue.HasValue)
                return await Task.FromResult(_genericRepo.AllAsNoTracking());

            return await Task.FromResult(
                _genericRepo.AllAsNoTracking().Where(x => EF.Property<bool>(x, "Activo") == boolValue.Value)
            );
        }

        public async Task<T> GetByIDShort(short id) => await _genericRepo.FindShort(id);

        public async Task<T> GetByID(long id) => await _genericRepo.FindLong(id);

        public async Task<T> GetByIDInt(int id) => await _genericRepo.Find(id);

        public async Task<IEnumerable<T>> GetByParam(Expression<Func<T, bool>> where)
        {
            return await _genericRepo.Find(where);
        }

        public async Task Add(T genericClass)
        {
            if (await IsDuplicate(genericClass))
                throw new InvalidOperationException("El registro ya existe.");

            await _genericRepo.AddWithImage(genericClass);
        }

        // ✅ CAMBIO: sigue recibiendo int (no rompemos controllers),
        // pero internamente buscamos por id genérico (sirve para PK short/int/long)
        public async Task Delete(int Id)
        {
            // ✅ CAMBIO: ya NO usamos Find(int) porque rompe si la PK no es int
            var entity = await _genericRepo.FindByIdAsync(Id);

            if (entity == null)
                throw new KeyNotFoundException("El registro no existe.");

            // ✅ CAMBIO: validación con id genérico
            bool tieneRelacionesActivas = await TieneRelacionesActivas(Id);

            if (tieneRelacionesActivas)
            {
                throw new InvalidOperationException(
                    "No se puede desactivar el registro porque existen entidades relacionadas activas (Vigente = 'S').");
            }

            typeof(T).GetProperty("Vigente")?.SetValue(entity, "N");

            await _genericRepo.Update(entity);
        }

        public async Task DeleteUsuario(int Id)
        {
            // ✅ CAMBIO: también conviene usar FindByIdAsync por consistencia
            var entity = await _genericRepo.FindByIdAsync(Id);

            if (entity == null)
                throw new KeyNotFoundException("El registro no existe.");

            typeof(T).GetProperty("Activo")?.SetValue(entity, false);

            await _genericRepo.Update(entity);
        }

        public virtual async Task<T> Update(T genericClass)
        {
            var pkProperty = _genericRepo.GetPrimaryKeyProperty(genericClass);
            var id = pkProperty.GetValue(genericClass);

            var originalEntity = await _genericRepo.FindByIdAsync(id);
            if (originalEntity == null)
                throw new InvalidOperationException("Entidad no encontrada.");

            // VALIDACIONES DE VIGENTE (igual que ahora)
            var vigenteProperty = typeof(T).GetProperty("Vigente");
            var originalVigente = vigenteProperty?.GetValue(originalEntity)?.ToString();
            var newVigente = vigenteProperty?.GetValue(genericClass)?.ToString();

            if (vigenteProperty != null && originalVigente == "S" && newVigente == "N")
            {
                bool tieneRelacionesActivas = await TieneRelacionesActivas(id);
                if (tieneRelacionesActivas)
                    throw new InvalidOperationException(
                        "No se puede cambiar Vigente a 'N' porque existen relaciones activas.");
            }

            // ✅ CLAVE: copiar valores al objeto TRACKED
            _context.Entry(originalEntity).CurrentValues.SetValues(genericClass);

            await _context.SaveChangesAsync();
            return originalEntity;
        }


        // ✅ CAMBIO CRÍTICO: antes era int y asumía FK int.
        // Ahora acepta object y tipa id al tipo REAL de la FK.
        private async Task<bool> TieneRelacionesActivas(object id)
        {
            var entityType = typeof(T);
            var navigationProperties = _context.Model.FindEntityType(entityType)?.GetNavigations();

            if (navigationProperties == null)
                return false;

            foreach (var navigation in navigationProperties)
            {
                var relatedEntityType = navigation.TargetEntityType.ClrType;

                var vigenteProp = relatedEntityType.GetProperty("Vigente");
                if (vigenteProp == null)
                    continue;

                // ✅ CAMBIO: obtener DbSet por reflection
                var dbSet = GetQueryable(relatedEntityType);
                if (dbSet == null) continue;

                var parameter = Expression.Parameter(relatedEntityType, "e");

                // ✅ CAMBIO: FK tipada con su tipo real
                var fkProp = navigation.ForeignKey.Properties.First();
                var fkName = fkProp.Name;
                var fkType = fkProp.ClrType;

                var foreignKeyProperty = Expression.Call(
                    typeof(EF),
                    nameof(EF.Property),
                    new[] { fkType },
                    parameter,
                    Expression.Constant(fkName)
                );

                var typedId = Convert.ChangeType(id, fkType);

                var equals = Expression.Equal(
                    foreignKeyProperty,
                    Expression.Constant(typedId, fkType)
                );

                // Vigente == "S"
                var vigentePropertyExpr = Expression.Call(
                    typeof(EF),
                    nameof(EF.Property),
                    new[] { typeof(string) },
                    parameter,
                    Expression.Constant("Vigente")
                );

                var vigenteEqualsS = Expression.Equal(vigentePropertyExpr, Expression.Constant("S"));

                var combinedCondition = Expression.AndAlso(equals, vigenteEqualsS);

                var lambda = Expression.Lambda(combinedCondition, parameter);

                var anyMethod = typeof(Queryable).GetMethods()
                    .First(m => m.Name == "Any"
                                && m.GetParameters().Length == 2
                                && m.GetParameters()[1].ParameterType.Name.StartsWith("Expression"))
                    .MakeGenericMethod(relatedEntityType);

                var hasActiveDependents = SafeInvokeBool(anyMethod, dbSet, lambda);

                if (hasActiveDependents)
                    throw new InvalidOperationException(
                        $"No se puede eliminar el registro porque tiene relaciones activas en {relatedEntityType.Name}.");
            }

            return false;
        }

        // ✅ NUEVO: helper para DbContext.Set<T>() por Type (igual que en Repo)
        private IQueryable GetQueryable(Type clrType)
        {
            var setMethod = typeof(DbContext).GetMethods()
                .First(m => m.Name == nameof(DbContext.Set)
                            && m.IsGenericMethod
                            && m.GetParameters().Length == 0);

            var generic = setMethod.MakeGenericMethod(clrType);
            var dbSetObj = generic.Invoke(_context, null);

            return dbSetObj as IQueryable;
        }

        public virtual async Task<T> UpdatePOF(T genericClass)
        {
            return await _genericRepo.Update(genericClass);
        }

        private async Task<bool> IsDuplicate(T entity)
        {
            if (entity is not IRegistroUnico uniqueEntity)
                return false;

            foreach (var property in uniqueEntity.UniqueProperties)
            {
                var propertyInfo = typeof(T).GetProperty(property);
                if (propertyInfo == null)
                    throw new ArgumentException($"La entidad no contiene un campo '{property}'.");

                var entities = (await _genericRepo.GetAllAsync()).AsEnumerable();

                foreach (var existingEntity in entities)
                {
                    var existingValue = propertyInfo.GetValue(existingEntity);
                    var value = propertyInfo.GetValue(entity);

                    if (existingValue != null && existingValue.Equals(value))
                        return true;
                }
            }

            return false;
        }

        private static bool SafeInvokeBool(MethodInfo method, params object[] args)
        {
            var result = method.Invoke(null, args);
            return result is bool b && b;
        }
    }
}
