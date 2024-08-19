namespace API.DataSchema
{
    using System;

    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    sealed class ConnectionNameAttribute : Attribute
    {
        public string ConnectionName { get; }

        public ConnectionNameAttribute(string connectionName)
        {
            ConnectionName = connectionName;
        }
    }

}
