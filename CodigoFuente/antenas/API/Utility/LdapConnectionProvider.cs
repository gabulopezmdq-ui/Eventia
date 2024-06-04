using Microsoft.Extensions.Configuration;
using Novell.Directory.Ldap;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
namespace API.Utility
{
    public interface ILdapConnectionProvider
    {
        LdapConnection GetConnection();
    }

    public class LdapConnectionProvider : ILdapConnectionProvider
    {
        private readonly IConfiguration _config;
        private LdapConnection _connection;

        public LdapConnectionProvider(IConfiguration config)
        {
            _config = config;
        }

        public LdapConnection GetConnection()
        {
            if (_connection == null)
            {
                var ldapConfig = _config.GetSection("Ldap");
                var host = ldapConfig.GetValue<string>("Host");
                var port = ldapConfig.GetValue<int>("Port");
                var username = ldapConfig.GetValue<string>("Username");
                var password = ldapConfig.GetValue<string>("Password");
                var searchBase = ldapConfig.GetValue<string>("SearchBase");
                var version = ldapConfig.GetValue<string>("Version");

                _connection = new LdapConnection
                {
                    SecureSocketLayer = false,
                    /* UserDefinedServerCertValidationDelegate = (sender, certificate, chain, sslPolicyErrors) =>
                     {
                         // Validar el certificado del servidor aquí
                         // Devolver true si el certificado es válido, de lo contrario false
                         return true;
                     }*/
                };
                try
                {
                    _connection.ConnectAsync(host, port);
                    _connection.BindAsync("sebastianperez", "seba9876");
                    if (_connection.Bound)
                    {
                        Console.WriteLine("LDAP SUCCESS");
                        //return true;
                    }
                }
                catch (LdapException ex)
                {
                    if (ex.ResultCode == 49)
                    {
                        Match match = Regex.Match(ex.LdapErrorMessage, @"data (\d+)");

                        int errorCode = int.Parse(match.Groups[1].Value, System.Globalization.NumberStyles.HexNumber);

                        throw;
                    }
                    throw;
                }

            }

            return _connection;
            throw new NotImplementedException();
        }
    }
}
