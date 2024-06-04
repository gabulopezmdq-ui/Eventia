using Microsoft.Extensions.Configuration;
using Novell.Directory.Ldap;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Utility
{
    public interface ILdapValidator
    {
        /// <summary>
        /// Check if user in Ldap 
        /// </summary>
        /// <param name="userId">Ldap user name without domain name</param>
        /// <param name="password">Ldap passsword</param>
        bool Validate(string userId, string password);
    }

    /// <summary>
    /// Ldap related tasks manager
    /// </summary>
    public class LdapManager : ILdapValidator
    {
        /// <summary>
        /// Domain name from config file
        /// </summary>
        public readonly string DomainName;
        /// <summary>
        /// Port name form config file, default 389
        /// </summary>
        public readonly int PortNumber;

        private readonly IConfiguration _config;

        /*public Account(IConfiguration config)
        {
            _config = config;
        }*/
        public LdapManager(IConfiguration config)
        {
            _config = config;
            DomainName = _config.GetValue<string>("Ldap:Dominio");
            PortNumber = int.Parse(_config.GetValue<string>("Ldap:Puerto")); /*LdapConnection.DEFAULT_PORT*/
        }

        /// <summary>
        /// Check if user in Ldap 
        /// </summary>
        /// <param name="userId">Ldap user name without domain name</param>
        /// <param name="password">Ldap passsword</param>
        public bool Validate(string userId, string password)
        {
            try
            {
                //String[] dns = new[] { "cn=" + userId, "CN=Users", "dc=mardelplata", "dc=gov", "dc=ar" };
                //String[] dns = new[] { "cn=" + userId, _config.GetValue<string>("Ldap:DNs"), _config.GetValue<string>("Ldap:BaseDn") };
                //String userDN = string.Join(",", dns);
                //probar hacer join la cadena a mano
                string userDN = string.Format("cn={0},{1},{2}", userId, _config.GetValue<string>("Ldap:DNs"), _config.GetValue<string>("Ldap:BaseDn"));   //"cn=" + userId+","+_config.GetValue<string>("Ldap:DNs") +","+ _config.GetValue<string>("Ldap:BaseDn");
                int Version = int.Parse(_config.GetValue<string>("Ldap:Version"));
                using (var connection = new LdapConnection { SecureSocketLayer = false })
                {
                    connection.Connect(DomainName, PortNumber);
                    connection.Bind(Version, userDN, password);
                    //connection.Bind(Version, cadena, password);
                    return connection.Bound;
                }
            }
            catch (LdapException ex)
            {
                return false;
            }
        }

        /// <summary>
        /// User full id 
        /// </summary>
        /// <param name="userId">User name</param>
        /// <returns>userName@domain</returns>
        public string UserFullId(string userId)
        {
            string value = string.Format(@"{0}@{1}", userId, DomainName);
            return value;
        }
    }
}
