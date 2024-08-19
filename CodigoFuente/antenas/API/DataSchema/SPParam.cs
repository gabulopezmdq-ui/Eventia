using System.Collections.Generic;
using System.Data.Odbc;

namespace API.DataSchema
{
    public class SPParam
    {
        public string Name { get; set; }
        public bool IsOutput { get; set; }
        /// <summary>
        /// required if IsOutput
        /// </summary>
        public OdbcType? Type { get; set; }
        /// <summary>
        /// required if type is char, varchar, etc
        /// </summary>
        public int? Size { get; set; }
        /// <summary>
        /// required if not IsOutput
        /// </summary>
        public object Value { get; set; }


    }
}
