using API.DataSchema;
using System.Collections.Generic;

namespace API.Services
{
	public interface ISPService
	{
		List<T> ExecuteStoredProcedure<T>(string schemaName, string procedureName, ref List<SPParam> parameterList);
	}
}
