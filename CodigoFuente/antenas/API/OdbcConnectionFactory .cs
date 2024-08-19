//using API.DataSchema;
//using API.Repositories;
//using API.Services;
//using API.Utility;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.AspNetCore.Builder;
//using Microsoft.AspNetCore.Hosting;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using Microsoft.IdentityModel.Logging;
//using Microsoft.IdentityModel.Tokens;
//using System.Text.Json.Serialization;

//using System.Data.Odbc;

using API.DataSchema;
using System.Data.Odbc;
using System;
using System.Reflection;

namespace API
{
    public class OdbcConnectionFactory : IOdbcConnectionFactory
    {
        private readonly string _sigemdbConnectionString;
        private readonly string _infogestConnectionString;

        public OdbcConnectionFactory(string sigemdbConnectionString, string infogestConnectionString)
        {
            _sigemdbConnectionString = sigemdbConnectionString;
            _infogestConnectionString = infogestConnectionString;
        }

        public OdbcConnection GetConnectionForRepository<T>()
        {
            var entityType = typeof(T);
            var connectionAttribute = entityType.GetCustomAttribute<ConnectionNameAttribute>();

            if (connectionAttribute != null)
            {
                string connectionName = connectionAttribute.ConnectionName;
                if (connectionName == "sigemdb")
                {
                    return new OdbcConnection(_sigemdbConnectionString);
                }
                else if (connectionName == "infogest")
                {
                    return new OdbcConnection(_infogestConnectionString);
                }
            }

            throw new InvalidOperationException("No se pudo determinar la conexión para el repositorio.");
        }
    }
}
