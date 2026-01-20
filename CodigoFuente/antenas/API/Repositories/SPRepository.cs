using API.DataSchema;
using Microsoft.AspNetCore.Connections;
using System.Collections.Generic;
using System.Data.Odbc;
using System.Data;
using System.Linq;
using System.Xml.XPath;
using System;
using System.Reflection;

namespace API.Repositories
{
	public class SPRepository : ISPRepository
	{
		private IOdbcConnectionFactory _connectionFactory;
		
		public SPRepository(IOdbcConnectionFactory connectionFactory)
		{
			_connectionFactory = connectionFactory;
		}
		public virtual List<T> ExecuteStoredProcedure<T>(string schemaName, string procedureName, ref List<SPParam> parameterList)
		{
			var entityType = typeof(T);
			PropertyInfo[] propiedades = entityType.GetProperties();

			List<T> response = new();
			// get call string
			string callString = $"{{call {schemaName}.{procedureName}";
			// build call string using parameter list
			if (parameterList?.Count > 0)
			{
				callString += "(";
				callString += string.Join(",", Enumerable.Repeat("?", parameterList.Count));
				callString += ")";
			}
			callString += "}";

			//start sp connection
			using (var connection = _connectionFactory.GetConnectionForRepository<T>())
			{
				connection.Open();
				using (var command = new OdbcCommand(callString, connection))
				{
					command.CommandType = CommandType.StoredProcedure;
					
					// Configura el tiempo de espera si es necesario
					//command.CommandTimeout = 600;

					// Configura los parámetros del procedimiento almacenado
					if (parameterList?.Count > 0)
					{
						foreach (var parameter in parameterList)
						{
							if (!parameter.IsOutput)
								command.Parameters.AddWithValue($"@{parameter.Name}", parameter.Value);
							else
							{
								var parameterToAdd = parameter.Size is null ? new OdbcParameter($"@{parameter.Name}", parameter.Type) : new OdbcParameter($"@{parameter.Name}", (OdbcType)parameter.Type, (int)parameter.Size);
								command.Parameters.Add(parameterToAdd).Direction = ParameterDirection.Output;
							}
						}

					}
					// Ejecuta el procedimiento 
					using (var reader = command.ExecuteReader())
					{
						while (reader.Read())
						{
							var newObject = Activator.CreateInstance<T>();

							for (int i = 0; i < reader.FieldCount; i++)
							{
								var columnName = reader.GetName(i);
								var columnValue = reader.GetValue(i);

								if (!reader.IsDBNull(i))
								{
									var propiedad = propiedades.FirstOrDefault(p => p.Name == columnName);

									propiedad?.SetValue(newObject, columnValue.ToString());
								}
							}

							response.Add(newObject);
						}
					}
					parameterList = parameterList.Select(p =>
					{
						if (p.IsOutput)
							p.Value = command.Parameters[$"@{p.Name}"].Value;
						return p;
					}).ToList();
				}
			}
			return response;
		}

	
	}
}
