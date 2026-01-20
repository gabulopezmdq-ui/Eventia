//using API.DataSchema;
//using API.Repositories;
//using System.Collections.Generic;

//namespace API.Services
//{
//	public class SPService : ISPService
//	{
//		private ISPRepository _repository;
//		public SPService(ISPRepository repository)
//		{
//			_repository = repository;
//		}
//		public List<T> ExecuteStoredProcedure<T>(string schemaName, string procedureName, ref List<SPParam> parameterList)
//		{
//			return _repository.ExecuteStoredProcedure<T>(schemaName, procedureName, ref parameterList);
//		}
//	}
//}
