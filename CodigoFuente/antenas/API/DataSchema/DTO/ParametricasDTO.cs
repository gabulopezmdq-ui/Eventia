using System;

namespace API.DataSchema.DTO
{
    public class ParametricaDTO
    {
        public long Id { get; set; }
        public string Codigo { get; set; }
        public string Texto { get; set; }
        public short? Orden { get; set; }
    }
}
