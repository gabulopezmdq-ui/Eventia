using System.Collections.Generic;
using API.DataSchema;

namespace API.Repositories
{
	public interface ISPRepository
	{
        List<T> ExecuteStoredProcedure<T>(string schemaName, string procedureName, ref List<SPParam> parameterList);
	}
}
