namespace API.DataSchema.DTO
{
    public class ParamTraduccionFaltanteDTO
    {
        public string entidad { get; set; } = null!;
        public long id_item { get; set; }
        public string codigo { get; set; } = null!;

        public short id_idioma { get; set; }
        public string locale { get; set; } = null!;

        public string? texto_actual { get; set; }
        public bool? traduccion_activa { get; set; }
    }

    public class ParamTraduccionFaltantesResumenDTO
    {
        public string entidad { get; set; } = null!;
        public int items_activos { get; set; }
        public int total_esperado { get; set; }
        public int faltantes { get; set; }
    }
}